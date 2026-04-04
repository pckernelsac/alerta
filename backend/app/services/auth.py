"""Dependencias FastAPI para autenticación y autorización."""

from fastapi import HTTPException, Request

from app.services.supabase import get_supabase


class AuthUser:
    """Datos mínimos del usuario autenticado."""

    __slots__ = ("id", "email", "role")

    def __init__(self, id: str, email: str, role: str = "user"):
        self.id = id
        self.email = email
        self.role = role


def _extract_token(request: Request) -> str:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token requerido.")
    return auth_header.split(" ", 1)[1]


def _verify_user(token: str) -> AuthUser:
    sb = get_supabase()
    try:
        resp = sb.auth.get_user(token)
        user = resp.user
        if not user:
            raise HTTPException(status_code=401, detail="Token inválido.")

        # Obtener rol desde profiles
        result = (
            sb.table("profiles")
            .select("role")
            .eq("id", str(user.id))
            .single()
            .execute()
        )
        role = result.data.get("role", "user") if result.data else "user"

        return AuthUser(id=str(user.id), email=user.email or "", role=role)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido o expirado.")


def get_current_user(request: Request) -> AuthUser:
    token = _extract_token(request)
    return _verify_user(token)


def get_admin_user(request: Request) -> AuthUser:
    token = _extract_token(request)
    user = _verify_user(token)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Acceso solo para administradores.")
    return user
