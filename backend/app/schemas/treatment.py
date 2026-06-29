from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import TreatmentStatus


class TreatmentBase(BaseModel):
    patient_id: int
    dentist_id: int | None = None
    tooth_fdi: str | None = None
    diagnosis: str
    procedure: str
    cost: float = Field(default=0, ge=0)
    treatment_date: date | None = None
    status: TreatmentStatus = TreatmentStatus.PENDING
    observations: str | None = None


class TreatmentCreate(TreatmentBase):
    pass


class TreatmentUpdate(BaseModel):
    dentist_id: int | None = None
    tooth_fdi: str | None = None
    diagnosis: str | None = None
    procedure: str | None = None
    cost: float | None = Field(default=None, ge=0)
    treatment_date: date | None = None
    status: TreatmentStatus | None = None
    observations: str | None = None


class TreatmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    patient_name: str | None = None
    dentist_id: int | None = None
    dentist_name: str | None = None
    tooth_fdi: str | None = None
    diagnosis: str
    procedure: str
    cost: float
    treatment_date: date | None = None
    status: TreatmentStatus
    observations: str | None = None
    paid_amount: float = 0
    created_at: datetime


class PaginatedTreatments(BaseModel):
    items: list[TreatmentRead]
    total: int
    page: int
    size: int
