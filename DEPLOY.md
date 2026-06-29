# Despliegue en producción (Dokploy)

Arquitectura: **nginx (frontend SPA + reverse-proxy)** → **FastAPI/Gunicorn (backend)** → **PostgreSQL** (servicio ya creado en Dokploy).
El navegador solo habla con nginx; este redirige `/api`, `/uploads` y `/health` al backend, por lo que no hay CORS ni URLs de API embebidas en el build.

```
Internet ──▶ Traefik (Dokploy) ──▶ frontend:80 (nginx)
                                      ├─ /            → SPA (React build)
                                      └─ /api,/uploads → backend:8000 (Gunicorn)
                                                            └─▶ app-madrid-db-qfgme1:5432
```

## 1. Requisitos en Dokploy
- La BD PostgreSQL ya existe: host `app-madrid-db-qfgme1`, db `madrid`, user `madrid_user`.
- La red `dokploy-network` existe (la crea Dokploy por defecto).

## 2. Crear la aplicación
1. **Create Application → Compose** (Docker Compose).
2. Conecta este repositorio de GitHub.
3. **Compose File**: `docker-compose.prod.yml`.
4. **Environment**: pega el contenido de `.env.production.example` con los valores reales
   (o sube el archivo `.env.production`). Variables clave:
   - `POSTGRES_*` → credenciales de tu BD.
   - `SECRET_KEY` → genera uno nuevo: `python -c "import secrets; print(secrets.token_urlsafe(64))"`.
   - `FIRST_SUPERUSER_EMAIL` / `FIRST_SUPERUSER_PASSWORD`.
5. **Domains**: añade tu dominio al servicio **`frontend`**, puerto **80** (Dokploy gestiona el TLS).
6. **Deploy**.

## 3. Qué ocurre en el primer arranque
El `entrypoint.sh` del backend:
1. Espera a que la BD acepte conexiones (`app.prestart`).
2. Crea las tablas (idempotente) y siembra el admin + ajustes de clínica (`app.initial_data`).
3. Arranca Gunicorn con workers Uvicorn en el puerto 8000.

## 4. Post-despliegue
- Entra con `FIRST_SUPERUSER_EMAIL` / `FIRST_SUPERUSER_PASSWORD` y **cambia la contraseña**.
- Verifica `https://TU-DOMINIO/health` → `{"status":"ok"}`.
- Las radiografías subidas persisten en el volumen `backend_uploads`.

## 5. Notas
- `/docs` y `/redoc` están **deshabilitados** cuando `ENVIRONMENT=production`.
- Migraciones: el bootstrap usa `create_all` (BD nueva). Para cambios de esquema
  futuros, genera migraciones con Alembic (`alembic revision --autogenerate`) y
  cambia el entrypoint a `alembic upgrade head`.
- Desarrollo local sigue usando `docker-compose.yml` (Postgres en el puerto 5433).
