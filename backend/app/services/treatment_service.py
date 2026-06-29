from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.cashbox import CashMovement
from app.models.enums import CashMovementType, TreatmentStatus
from app.models.treatment import Treatment
from app.repositories.patient import PatientRepository
from app.repositories.treatment import TreatmentRepository
from app.schemas.treatment import (
    TreatmentCreate,
    TreatmentRead,
    TreatmentUpdate,
)


class TreatmentService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = TreatmentRepository(db)
        self.patients = PatientRepository(db)

    def _paid_amounts(self, treatment_ids: list[int]) -> dict[int, float]:
        if not treatment_ids:
            return {}
        stmt = (
            select(
                CashMovement.treatment_id,
                func.coalesce(func.sum(CashMovement.amount), 0),
            )
            .where(
                CashMovement.treatment_id.in_(treatment_ids),
                CashMovement.movement_type == CashMovementType.INCOME,
            )
            .group_by(CashMovement.treatment_id)
        )
        return {tid: float(total) for tid, total in self.db.execute(stmt).all()}

    def _to_read(self, t: Treatment, paid: float = 0) -> TreatmentRead:
        return TreatmentRead(
            id=t.id,
            patient_id=t.patient_id,
            patient_name=t.patient.full_name if t.patient else None,
            dentist_id=t.dentist_id,
            dentist_name=t.dentist.full_name if t.dentist else None,
            tooth_fdi=t.tooth_fdi,
            diagnosis=t.diagnosis,
            procedure=t.procedure,
            cost=float(t.cost),
            treatment_date=t.treatment_date,
            status=t.status,
            observations=t.observations,
            paid_amount=paid,
            created_at=t.created_at,
        )

    def search(
        self,
        patient_id: int | None,
        status_filter: TreatmentStatus | None,
        page: int,
        size: int,
    ) -> tuple[list[TreatmentRead], int]:
        items, total = self.repo.search(
            patient_id, status_filter, (page - 1) * size, size
        )
        paid = self._paid_amounts([t.id for t in items])
        return [self._to_read(t, paid.get(t.id, 0)) for t in items], total

    def get(self, treatment_id: int) -> Treatment:
        t = self.repo.get(treatment_id)
        if t is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Treatment not found"
            )
        return t

    def get_read(self, treatment_id: int) -> TreatmentRead:
        t = self.get(treatment_id)
        paid = self._paid_amounts([t.id]).get(t.id, 0)
        return self._to_read(t, paid)

    def create(self, data: TreatmentCreate) -> TreatmentRead:
        if self.patients.get(data.patient_id) is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found"
            )
        t = Treatment(**data.model_dump())
        self.repo.create(t)
        self.db.commit()
        self.db.refresh(t)
        return self._to_read(t)

    def update(self, treatment_id: int, data: TreatmentUpdate) -> TreatmentRead:
        t = self.get(treatment_id)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(t, field, value)
        self.db.commit()
        self.db.refresh(t)
        paid = self._paid_amounts([t.id]).get(t.id, 0)
        return self._to_read(t, paid)

    def delete(self, treatment_id: int) -> None:
        t = self.get(treatment_id)
        self.repo.delete(t)
        self.db.commit()
