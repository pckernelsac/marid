#!/usr/bin/env sh
# ── Production entrypoint ──────────────────────────────────────────────
# 1. Wait for PostgreSQL to accept connections.
# 2. Create tables (idempotent) and seed the first admin + clinic settings.
# 3. Launch Gunicorn with Uvicorn workers.
set -e

echo "[entrypoint] Waiting for the database..."
python -m app.prestart

echo "[entrypoint] Bootstrapping schema and seed data..."
python -m app.initial_data

echo "[entrypoint] Starting Gunicorn (${WEB_CONCURRENCY:-3} workers)..."
exec gunicorn app.main:app \
    --worker-class uvicorn.workers.UvicornWorker \
    --workers "${WEB_CONCURRENCY:-3}" \
    --bind 0.0.0.0:8000 \
    --timeout 120 \
    --graceful-timeout 30 \
    --access-logfile - \
    --error-logfile -
