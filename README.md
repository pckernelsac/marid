# Madrid Dental Studio

Sistema interno de historia clínica odontológica. Aplicación de una sola clínica
(no SaaS, sin IA). El módulo central es un **odontograma digital vectorial (SVG)**.

## Stack

| Capa     | Tecnologías                                                                 |
| -------- | --------------------------------------------------------------------------- |
| Frontend | React 19, TypeScript, Vite, TailwindCSS, TanStack Query, React Router, Framer Motion, React Hook Form, React Hot Toast, Recharts |
| Backend  | FastAPI, SQLAlchemy 2.0, Alembic, Pydantic V2, JWT, Argon2                   |
| BD       | PostgreSQL (modelo normalizado)                                             |

## Arquitectura

```
backend/
  app/
    core/         configuración, seguridad (Argon2/JWT), sesión de BD
    models/       ORM SQLAlchemy 2.0 (normalizado, FKs, índices, constraints)
    schemas/      Pydantic V2 (entrada/salida)
    repositories/ Repository Pattern
    services/     Service Layer (lógica de negocio)
    api/v1/       routers y endpoints REST
  alembic/        migraciones
frontend/
  src/
    app/          router, providers, rutas protegidas
    components/   layout + primitivas UI (estilo shadcn)
    features/
      auth/       contexto de autenticación
      patients/   hooks de datos
      odontogram/ ★ el odontograma vectorial (Tooth.tsx, chart, panel, undo/redo)
    pages/        páginas por módulo
```

El odontograma se construye **100% en SVG**: cada diente es un componente React,
cada superficie (vestibular, lingual, mesial, distal, oclusal) es un `<polygon>`
independiente con eventos, color por estado clínico, tooltip y animaciones
Framer Motion. Cada cambio genera un registro **inmutable** en `odontogram_history`.

## Puesta en marcha

### 1. Base de datos

Crea una base PostgreSQL llamada `madrid_dental` (o ajusta `.env`).

### 2. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
copy .env.example .env          # y edita credenciales

# Crear tablas + superusuario inicial
python -m app.initial_data

# (Producción) migraciones con Alembic:
#   alembic revision --autogenerate -m "init"
#   alembic upgrade head

uvicorn app.main:app --reload   # http://localhost:8000/docs
```

Usuario inicial (configurable en `.env`):
`admin@madriddental.studio` / `Admin123!`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                     # http://localhost:5173 (proxy /api → :8000)
```

## Estado de implementación

**Completo y verificado**
- Autenticación JWT + refresh, Argon2, rate limiting, CORS.
- Pacientes: CRUD + buscador instantáneo paginado.
- **Odontograma**: SVG vectorial, 4 denticiones (FDI), 12 estados clínicos,
  edición en panel lateral (no modal), historial inmutable, undo/redo, leyenda.
- Dashboard premium, layout estilo Apple, sidebar con los 11 módulos.

**Andamiaje listo para extender** (modelos + tablas ya creados)
- Historia clínica, tratamientos, agenda, radiografías, presupuestos, caja,
  reportes, configuración. Tienen modelo de datos y rutas placeholder en la UI.

## Seguridad
JWT (access + refresh), hashing Argon2 con rehash automático, rate limiting
(slowapi), CORS restringido, validación Pydantic estricta, control de roles
(`require_roles`), y tabla de auditoría inmutable.
