from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.models.denuncia_db import DenunciaDB, DenunciaEstado
from app.services.auth import AuthUser, get_admin_user
from app.services.supabase import get_supabase

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
    sb = get_supabase()
    query = sb.table(TABLE).select("*, profiles(email)").order("timestamp", desc=True)

    if estado:
        query = query.eq("estado", estado.value)
    if tipo:
        query = query.eq("tipo", tipo)

    result = query.limit(500).execute()

    denuncias = []
    for row in result.data:
        profile = row.pop("profiles", None)
        user_email = profile.get("email") if isinstance(profile, dict) else None
        denuncias.append(DenunciaConUsuario(**row, user_email=user_email))
    return denuncias


@router.patch("/denuncias/{denuncia_id}", response_model=DenunciaDB)
def actualizar_estado(
    denuncia_id: str,
    body: EstadoUpdate,
    _admin: AuthUser = Depends(get_admin_user),
) -> DenunciaDB:
    sb = get_supabase()
    result = (
        sb.table(TABLE)
        .update({"estado": body.estado.value})
        .eq("id", denuncia_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Denuncia no encontrada.")
    return DenunciaDB.model_validate(result.data[0])


@router.get("/stats", response_model=StatsResponse)
def obtener_stats(
    _admin: AuthUser = Depends(get_admin_user),
) -> StatsResponse:
    sb = get_supabase()
    result = sb.table(TABLE).select("estado").execute()
    rows = result.data

    total = len(rows)
    pendientes = sum(1 for r in rows if r["estado"] == "pendiente")
    en_revision = sum(1 for r in rows if r["estado"] == "en_revision")
    resueltas = sum(1 for r in rows if r["estado"] == "resuelta")

    return StatsResponse(
        total=total,
        pendientes=pendientes,
        en_revision=en_revision,
        resueltas=resueltas,
    )


@router.get("/me")
def admin_me(admin: AuthUser = Depends(get_admin_user)) -> dict[str, str]:
    return {"id": admin.id, "email": admin.email, "role": admin.role}
