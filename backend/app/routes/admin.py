from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from psycopg.rows import dict_row

from app.models.denuncia_db import DenunciaDB, DenunciaEstado
from app.services.auth import AuthUser, get_admin_user
from app.services.db import get_connection

TABLE = "denuncias"

router = APIRouter(prefix="/api/admin", tags=["admin"])


class DenunciaConUsuario(DenunciaDB):
    user_email: str | None = None


class EstadoUpdate(BaseModel):
    estado: DenunciaEstado


class StatsResponse(BaseModel):
    total: int
    pendientes: int
    en_revision: int
    resueltas: int


@router.get("/denuncias", response_model=list[DenunciaConUsuario])
def listar_denuncias_admin(
    _admin: AuthUser = Depends(get_admin_user),
    estado: DenunciaEstado | None = Query(None),
    tipo: str | None = Query(None),
) -> list[DenunciaConUsuario]:
    filters: list[str] = []
    params: list[str] = []
    if estado:
        filters.append("d.estado = %s")
        params.append(estado.value)
    if tipo:
        filters.append("d.tipo = %s")
        params.append(tipo)
    where_clause = f"WHERE {' AND '.join(filters)}" if filters else ""

    sql = f"""
        SELECT d.*, u.email AS user_email
        FROM {TABLE} d
        LEFT JOIN usuarios u ON d.user_id = u.id
        {where_clause}
        ORDER BY d.timestamp DESC
        LIMIT 500
    """
    with get_connection() as conn, conn.cursor(row_factory=dict_row) as cur:
        cur.execute(sql, tuple(params))
        rows = cur.fetchall()
    return [DenunciaConUsuario(**row) for row in rows]


@router.patch("/denuncias/{denuncia_id}", response_model=DenunciaDB)
def actualizar_estado(
    denuncia_id: str,
    body: EstadoUpdate,
    _admin: AuthUser = Depends(get_admin_user),
) -> DenunciaDB:
    with get_connection() as conn, conn.cursor(row_factory=dict_row) as cur:
        cur.execute(
            f"UPDATE {TABLE} SET estado = %s WHERE id = %s RETURNING *",
            (body.estado.value, denuncia_id),
        )
        updated = cur.fetchone()
        conn.commit()
    if not updated:
        raise HTTPException(status_code=404, detail="Denuncia no encontrada.")
    return DenunciaDB.model_validate(updated)


@router.get("/stats", response_model=StatsResponse)
def obtener_stats(
    _admin: AuthUser = Depends(get_admin_user),
) -> StatsResponse:
    with get_connection() as conn, conn.cursor(row_factory=dict_row) as cur:
        cur.execute(f"SELECT estado, COUNT(*) AS total FROM {TABLE} GROUP BY estado")
        rows = cur.fetchall()

    counts = {row["estado"]: row["total"] for row in rows}
    total = sum(counts.values())
    pendientes = counts.get("pendiente", 0)
    en_revision = counts.get("en_revision", 0)
    resueltas = counts.get("resuelta", 0)

    return StatsResponse(
        total=total,
        pendientes=pendientes,
        en_revision=en_revision,
        resueltas=resueltas,
    )


@router.get("/me")
def admin_me(admin: AuthUser = Depends(get_admin_user)) -> dict[str, str]:
    return {"id": admin.id, "email": admin.email, "role": admin.role}
