from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.models.enums import TreatmentStatus
from app.models.treatment import Treatment
from app.repositories.base import BaseRepository


class TreatmentRepository(BaseRepository[Treatment]):
    def __init__(self, db: Session) -> None:
        super().__init__(Treatment, db)

    def search(
        self,
        patient_id: int | None,
        status: TreatmentStatus | None,
        skip: int,
        limit: int,
    ) -> tuple[list[Treatment], int]:
        stmt = select(Treatment).options(
            joinedload(Treatment.patient), joinedload(Treatment.dentist)
        )
        count_stmt = select(func.count(Treatment.id))
        if patient_id is not None:
            stmt = stmt.where(Treatment.patient_id == patient_id)
            count_stmt = count_stmt.where(Treatment.patient_id == patient_id)
        if status is not None:
            stmt = stmt.where(Treatment.status == status)
            count_stmt = count_stmt.where(Treatment.status == status)
        total = self.db.execute(count_stmt).scalar_one()
        stmt = stmt.order_by(Treatment.created_at.desc()).offset(skip).limit(limit)
        items = list(self.db.execute(stmt).scalars().all())
        return items, total
