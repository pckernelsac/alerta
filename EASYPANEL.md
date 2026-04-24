# Deploy en EasyPanel

Este proyecto queda listo para desplegar en EasyPanel con el archivo `docker-compose.easypanel.yml`.

## 1) Crear app en EasyPanel

- En EasyPanel, crea una app tipo **Docker Compose**.
- Conecta este repositorio de GitHub.
- Usa como archivo de despliegue: `docker-compose.easypanel.yml`.

## 2) Variables de producción recomendadas

En el servicio `backend`, reemplaza como minimo:

- `DATABASE_URL=postgres://postgres:jce29xl4hnfe56ne5jzn@conce_bd-alerta:5432/conce?sslmode=disable`
- `JWT_SECRET=<un-secreto-largo-y-unico>`
- `CORS_ORIGINS=https://tu-dominio.com`

Si publicas frontend y backend en el mismo dominio (recomendado), deja:

- Frontend build arg `VITE_API_URL=/api` (ya viene configurado).

## 3) Persistencia de datos

El compose ya incluye:

- `backend_uploads` para fotos subidas en `/uploads`.

## 4) Inicializar esquema

Como usas PostgreSQL externo (`conce_bd-alerta`), ejecuta una vez:

```bash
psql "postgres://postgres:jce29xl4hnfe56ne5jzn@conce_bd-alerta:5432/conce?sslmode=disable" \
  -f backend/sql/init_concepcion.sql
```

Si quieres crear/actualizar admin:

```bash
psql "postgres://postgres:<password>@<host>:5432/conce" \
  -v admin_email="admin@concepcion.gob.pe" \
  -v admin_password_hash="$2b$12$REEMPLAZAR_CON_HASH_BCRYPT" \
  -f backend/sql/seed_admin.sql
```

## 5) Health checks

- API: `/api/health`
- App web: `/`

## 6) Ruta de acceso final

- Frontend expuesto en puerto `8080` del servicio `frontend`.
- Nginx proxy enruta:
  - `/api/*` -> backend FastAPI
  - `/uploads/*` -> backend FastAPI

