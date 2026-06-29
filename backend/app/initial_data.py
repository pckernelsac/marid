"""Seed the database: create tables and the first superuser.

Run once after configuring the database:

    python -m app.initial_data
"""

import logging
from uuid import uuid4

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal, engine
from app.core.security import hash_password
from app.models import Base, ClinicSettings, User
from app.models.enums import UserRole
from app.repositories.user import UserRepository

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _ensure_patient_public_id(db: Session) -> None:
    """Idempotently add + backfill patients.public_id on existing databases.

    ``create_all`` only creates missing tables, so it never adds the new
    column to a table that already exists (e.g. the production DB). This
    migration adds the column, fills in opaque ids for legacy rows, and
    creates the unique index — all guarded so it is safe to run on boot.
    """
    if db.get_bind().dialect.name != "postgresql":
        return  # fresh create_all already covers dev/SQLite databases

    db.execute(
        text("ALTER TABLE patients ADD COLUMN IF NOT EXISTS public_id VARCHAR(32)")
    )
    db.commit()

    pending = db.execute(
        text("SELECT id FROM patients WHERE public_id IS NULL")
    ).fetchall()
    for (pid,) in pending:
        db.execute(
            text("UPDATE patients SET public_id = :pub WHERE id = :id"),
            {"pub": uuid4().hex, "id": pid},
        )
    if pending:
        db.commit()
        logger.info("Backfilled public_id for %d patient(s)", len(pending))

    db.execute(
        text(
            "CREATE UNIQUE INDEX IF NOT EXISTS ix_patients_public_id "
            "ON patients (public_id)"
        )
    )
    db.execute(text("ALTER TABLE patients ALTER COLUMN public_id SET NOT NULL"))
    db.commit()


def init() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        _ensure_patient_public_id(db)
        users = UserRepository(db)
        if users.get_by_email(settings.FIRST_SUPERUSER_EMAIL) is None:
            db.add(
                User(
                    email=settings.FIRST_SUPERUSER_EMAIL,
                    hashed_password=hash_password(settings.FIRST_SUPERUSER_PASSWORD),
                    full_name="Administrador",
                    role=UserRole.ADMIN,
                )
            )
            logger.info("Created first superuser: %s", settings.FIRST_SUPERUSER_EMAIL)
        if db.query(ClinicSettings).first() is None:
            db.add(ClinicSettings(name="Madrid Dental Studio"))
            logger.info("Created default clinic settings")
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    init()
