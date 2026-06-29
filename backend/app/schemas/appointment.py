from datetime import datetime

from pydantic import BaseModel, ConfigDict, model_validator

from app.models.enums import AppointmentStatus


class AppointmentBase(BaseModel):
    patient_id: int
    dentist_id: int | None = None
    title: str
    appointment_type: str | None = None
    color: str | None = None
    starts_at: datetime
    ends_at: datetime
    status: AppointmentStatus = AppointmentStatus.SCHEDULED
    notes: str | None = None

    @model_validator(mode="after")
    def _check_range(self) -> "AppointmentBase":
        if self.ends_at <= self.starts_at:
            raise ValueError("ends_at must be after starts_at")
        return self


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentUpdate(BaseModel):
    patient_id: int | None = None
    dentist_id: int | None = None
    title: str | None = None
    appointment_type: str | None = None
    color: str | None = None
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    status: AppointmentStatus | None = None
    notes: str | None = None


class AppointmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    patient_name: str | None = None
    dentist_id: int | None = None
    dentist_name: str | None = None
    title: str
    appointment_type: str | None = None
    color: str | None = None
    starts_at: datetime
    ends_at: datetime
    status: AppointmentStatus
    notes: str | None = None
