"""Seed the database: create tables and the first superuser.

Run once after configuring the database:

    python -m app.initial_data
"""

import logging

from app.core.config import settings
from app.core.database import SessionLocal, engine
from app.core.security import hash_password
from app.models import Base, ClinicSettings, User
from app.models.enums import UserRole
from app.repositories.user import UserRepository

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
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
