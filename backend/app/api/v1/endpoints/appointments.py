from datetime import datetime

from fastapi import APIRouter, Query, status

from app.api.deps import CurrentUser, DbSession
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentRead,
    AppointmentUpdate,
)
from app.services.appointment_service import AppointmentService

router = APIRouter(prefix="/appointments", tags=["appointments"])


@router.get("", response_model=list[AppointmentRead])
def list_appointments(
    db: DbSession,
    _: CurrentUser,
    date_from: datetime = Query(alias="from"),
    date_to: datetime = Query(alias="to"),
    dentist_id: int | None = Query(default=None),
    patient_id: int | None = Query(default=None),
) -> list[AppointmentRead]:
    return AppointmentService(db).list_range(
        date_from, date_to, dentist_id, patient_id
    )


@router.post("", response_model=AppointmentRead, status_code=status.HTTP_201_CREATED)
def create_appointment(
    db: DbSession, _: CurrentUser, data: AppointmentCreate
) -> AppointmentRead:
    return AppointmentService(db).create(data)


@router.patch("/{appointment_id}", response_model=AppointmentRead)
def update_appointment(
    db: DbSession, _: CurrentUser, appointment_id: int, data: AppointmentUpdate
) -> AppointmentRead:
    return AppointmentService(db).update(appointment_id, data)


@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appointment(db: DbSession, _: CurrentUser, appointment_id: int) -> None:
    AppointmentService(db).delete(appointment_id)
