from datetime import date, datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import ToothCondition, ToothSurface


class OdontogramEntryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tooth_fdi: str
    surface: ToothSurface
    condition: ToothCondition
    color: str | None = None
    diagnosis: str | None = None
    treatment_description: str | None = None
    treatment_date: date | None = None
    observations: str | None = None
    dentist_id: int | None = None
    updated_at: datetime


class OdontogramEntryUpsert(BaseModel):
    tooth_fdi: str
    surface: ToothSurface = ToothSurface.WHOLE
    condition: ToothCondition
    color: str | None = None
    diagnosis: str | None = None
    treatment_description: str | None = None
    treatment_date: date | None = None
    observations: str | None = None


class OdontogramHistoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tooth_fdi: str
    surface: ToothSurface
    previous_condition: ToothCondition | None = None
    new_condition: ToothCondition
    change_description: str | None = None
    changed_by_id: int | None = None
    changed_at: datetime


class OdontogramRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    entries: list[OdontogramEntryRead]
