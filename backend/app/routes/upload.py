import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile

from app.services.auth import AuthUser, get_current_user

router = APIRouter(prefix="/api", tags=["upload"])

MAX_SIZE = 5 * 1024 * 1024  # 5 MB
UPLOAD_DIR = Path("uploads")


@router.post("/upload")
async def upload_foto(
    file: UploadFile,
    _user: AuthUser = Depends(get_current_user),
) -> dict[str, str]:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Solo se permiten imágenes.")

    data = await file.read()
    if len(data) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="La imagen no debe superar 5 MB.")

    ext = (file.filename or "img.jpg").rsplit(".", 1)[-1] or "jpg"
    path = f"{uuid.uuid4()}.{ext}"
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    file_path = UPLOAD_DIR / path
    file_path.write_bytes(data)
    return {"url": f"/uploads/{path}"}
