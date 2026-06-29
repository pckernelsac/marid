from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.appointment import Appointment
from app.repositories.base import BaseRepository


class AppointmentRepository(BaseRepository[Appointment]):
    def __init__(self, db: Session) -> None:
        super().__init__(Appointment, db)

    def in_range(
        self,
        start: datetime,
        end: datetime,
        dentist_id: int | None,
        patient_id: int | None,
    ) -> list[Appointment]:
        stmt = (
            select(Appointment)
            .options(
                joinedload(Appointment.patient), joinedload(Appointment.dentist)
            )
            .where(Appointment.starts_at < end, Appointment.ends_at > start)
        )
        if dentist_id is not None:
            stmt = stmt.where(Appointment.dentist_id == dentist_id)
        if patient_id is not None:
            stmt = stmt.where(Appointment.patient_id == patient_id)
        stmt = stmt.order_by(Appointment.starts_at)
        return list(self.db.execute(stmt).scalars().all())
