from fastapi import APIRouter, Depends, HTTPException

from app.models.denuncia import DenunciaCreate, DenunciaResponse
from app.models.denuncia_db import DenunciaDB
from app.services.auth import AuthUser, get_current_user
from app.services.supabase import get_supabase

TABLE = "denuncias"

router = APIRouter(prefix="/api", tags=["denuncias"])


@router.post("/denuncias", response_model=DenunciaResponse)
def crear_denuncia(
    denuncia: DenunciaCreate,
    user: AuthUser = Depends(get_current_user),
) -> DenunciaResponse:
    sb = get_supabase()
    row = denuncia.model_dump()
    row["user_id"] = user.id
    result = sb.table(TABLE).insert(row).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="No se pudo guardar la denuncia.")
    return DenunciaResponse()


@router.get("/denuncias", response_model=list[DenunciaDB])
def listar_denuncias() -> list[DenunciaDB]:
    sb = get_supabase()
    result = (
        sb.table(TABLE)
        .select("*")
        .order("timestamp", desc=True)
        .limit(200)
        .execute()
    )
    return [DenunciaDB.model_validate(row) for row in result.data]
