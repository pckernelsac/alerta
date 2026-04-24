"""Modelo de denuncia persistida (tabla denuncias en PostgreSQL)."""

from datetime import datetime
from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, Field


class DenunciaEstado(StrEnum):
    PENDIENTE = "pendiente"
    EN_REVISION = "en_revision"
    RESUELTA = "resuelta"


class DenunciaDB(BaseModel):
    id: UUID
    tipo: str
    descripcion: str
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)
    estado: DenunciaEstado = DenunciaEstado.PENDIENTE
    timestamp: datetime
    user_id: UUID | None = None
    foto_url: str | None = None

    model_config = {"from_attributes": True}
