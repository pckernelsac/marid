from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ClinicalHistoryBase(BaseModel):
    allergies: bool = False
    allergies_detail: str | None = None
    diabetes: bool = False
    hypertension: bool = False
    anemia: bool = False
    hiv: bool = False
    pregnancy: bool = False
    hepatitis: bool = False
    bleeding_disorders: bool = False
    current_medication: str | None = None
    medical_antecedents: str | None = None
    observations: str | None = None


class ClinicalHistoryUpdate(ClinicalHistoryBase):
    """Full upsert payload — every field is optional via defaults."""


class ClinicalHistoryRead(ClinicalHistoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    created_at: datetime
    updated_at: datetime
