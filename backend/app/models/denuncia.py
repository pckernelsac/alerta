from pydantic import BaseModel, Field


class DenunciaCreate(BaseModel):
    tipo: str = Field(..., min_length=1)
    descripcion: str = Field(..., min_length=1)
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)
    foto_url: str | None = None


class DenunciaResponse(BaseModel):
    status: str = "ok"
    mensaje: str = "Denuncia registrada correctamente."
