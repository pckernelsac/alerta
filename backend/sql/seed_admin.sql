-- Seed de administrador para Alerta Concepcion
-- Uso recomendado:
-- psql "postgres://postgres:jce29xl4hnfe56ne5jzn@conce_bd-alerta:5432/conce?sslmode=disable" ^
--   -v admin_email="admin@concepcion.gob.pe" ^
--   -v admin_password_hash="$2b$12$REEMPLAZAR_CON_HASH_BCRYPT" ^
--   -f backend/sql/seed_admin.sql
--
-- Generar hash bcrypt (PowerShell, desde backend/):
-- python -c "import bcrypt; print(bcrypt.hashpw('TuPasswordSegura123!'.encode(), bcrypt.gensalt()).decode())"

BEGIN;

INSERT INTO usuarios (email, password_hash, role)
VALUES (
    :'admin_email',
    :'admin_password_hash',
    'admin'
)
ON CONFLICT (email) DO UPDATE
SET
    password_hash = EXCLUDED.password_hash,
    role = 'admin';

COMMIT;

