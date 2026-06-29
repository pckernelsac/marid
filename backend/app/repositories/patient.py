from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.patient import Patient
from app.repositories.base import BaseRepository


class PatientRepository(BaseRepository[Patient]):
    def __init__(self, db: Session) -> None:
        super().__init__(Patient, db)

    def get_by_dni(self, dni: str) -> Patient | None:
        stmt = select(Patient).where(Patient.dni == dni)
        return self.db.execute(stmt).scalar_one_or_none()

    def get_by_public_id(self, public_id: str) -> Patient | None:
        stmt = select(Patient).where(Patient.public_id == public_id)
        return self.db.execute(stmt).scalar_one_or_none()

    def search(
        self, query: str | None, skip: int, limit: int
    ) -> tuple[list[Patient], int]:
        stmt = select(Patient)
        count_stmt = select(func.count(Patient.id))
        if query:
            like = f"%{query.strip()}%"
            condition = or_(
                Patient.first_name.ilike(like),
                Patient.last_name.ilike(like),
                Patient.dni.ilike(like),
                Patient.phone.ilike(like),
            )
            stmt = stmt.where(condition)
            count_stmt = count_stmt.where(condition)
        total = self.db.execute(count_stmt).scalar_one()
        stmt = stmt.order_by(Patient.last_name, Patient.first_name).offset(skip).limit(limit)
        items = list(self.db.execute(stmt).scalars().all())
        return items, total
