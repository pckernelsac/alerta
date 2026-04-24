from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.config import get_settings
from app.routes.admin import router as admin_router
from app.routes.auth import router as auth_router
from app.routes.denuncia import router as denuncia_router
from app.routes.upload import router as upload_router

settings = get_settings()

app = FastAPI(
    title="alerta-concepcion API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(denuncia_router)
app.include_router(upload_router)
app.include_router(admin_router)
app.mount("/uploads", StaticFiles(directory="uploads", check_dir=False), name="uploads")

@app.get("/health")
def health_root() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


frontend_dist = Path("frontend_dist")
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")
else:
    @app.get("/")
    def root() -> dict[str, str]:
        return {"service": "alerta-concepcion-api", "status": "ok"}


def _run() -> None:
    import uvicorn

    s = get_settings()
    uvicorn.run("app.main:app", host=s.app_host, port=s.app_port, reload=True)


if __name__ == "__main__":
    _run()
