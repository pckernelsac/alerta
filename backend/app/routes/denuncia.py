from fastapi import APIRouter, Depends, HTTPException
from psycopg.rows import dict_row

from app.models.denuncia import DenunciaCreate, DenunciaResponse
from app.models.denuncia_db import DenunciaDB
from app.services.auth import AuthUser, get_current_user
from app.services.db import get_connection

TABLE = "denuncias"

router = APIRouter(prefix="/api", tags=["denuncias"])


@router.post("/denuncias", response_model=DenunciaResponse)
def crear_denuncia(
    denuncia: DenunciaCreate,
    user: AuthUser = Depends(get_current_user),
) -> DenunciaResponse:
    row = denuncia.model_dump()
    with get_connection() as conn, conn.cursor(row_factory=dict_row) as cur:
        cur.execute(
            f"""
            INSERT INTO {TABLE} (tipo, descripcion, lat, lon, foto_url, user_id)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
            """,
            (
                row["tipo"],
                row["descripcion"],
                row["lat"],
                row["lon"],
                row.get("foto_url"),
                user.id,
            ),
        )
        created = cur.fetchone()
        conn.commit()
    if not created:
        raise HTTPException(status_code=500, detail="No se pudo guardar la denuncia.")
    return DenunciaResponse()


@router.get("/denuncias", response_model=list[DenunciaDB])
def listar_denuncias(
    user: AuthUser = Depends(get_current_user),
) -> list[DenunciaDB]:
    with get_connection() as conn, conn.cursor(row_factory=dict_row) as cur:
        cur.execute(
            f"SELECT * FROM {TABLE} WHERE user_id = %s ORDER BY timestamp DESC LIMIT 200",
            (user.id,),
        )
        rows = cur.fetchall()
    return [DenunciaDB.model_validate(row) for row in rows]
