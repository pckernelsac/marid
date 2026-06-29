from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class RadiographRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    title: str
    file_url: str
    file_type: str
    taken_on: date | None = None
    notes: str | None = None
    created_at: datetime
