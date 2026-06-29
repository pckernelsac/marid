from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.appointment import Appointment
from app.repositories.appointment import AppointmentRepository
from app.repositories.patient import PatientRepository
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentRead,
    AppointmentUpdate,
)


class AppointmentService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = AppointmentRepository(db)
        self.patients = PatientRepository(db)

    @staticmethod
    def _to_read(a: Appointment) -> AppointmentRead:
        return AppointmentRead(
            id=a.id,
            patient_id=a.patient_id,
            patient_name=a.patient.full_name if a.patient else None,
            dentist_id=a.dentist_id,
            dentist_name=a.dentist.full_name if a.dentist else None,
            title=a.title,
            appointment_type=a.appointment_type,
            color=a.color,
            starts_at=a.starts_at,
            ends_at=a.ends_at,
            status=a.status,
            notes=a.notes,
        )

    def list_range(
        self,
        start: datetime,
        end: datetime,
        dentist_id: int | None,
        patient_id: int | None,
    ) -> list[AppointmentRead]:
        rows = self.repo.in_range(start, end, dentist_id, patient_id)
        return [self._to_read(a) for a in rows]

    def _get(self, appointment_id: int) -> Appointment:
        a = self.repo.get(appointment_id)
        if a is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found"
            )
        return a

    def create(self, data: AppointmentCreate) -> AppointmentRead:
        if self.patients.get(data.patient_id) is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found"
            )
        a = Appointment(**data.model_dump())
        self.repo.create(a)
        self.db.commit()
        self.db.refresh(a)
        return self._to_read(a)

    def update(
        self, appointment_id: int, data: AppointmentUpdate
    ) -> AppointmentRead:
        a = self._get(appointment_id)
        payload = data.model_dump(exclude_unset=True)
        starts = payload.get("starts_at", a.starts_at)
        ends = payload.get("ends_at", a.ends_at)
        if ends <= starts:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="ends_at must be after starts_at",
            )
        for field, value in payload.items():
            setattr(a, field, value)
        self.db.commit()
        self.db.refresh(a)
        return self._to_read(a)

    def delete(self, appointment_id: int) -> None:
        a = self._get(appointment_id)
        self.repo.delete(a)
        self.db.commit()
