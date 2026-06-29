from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.enums import Sex


class PatientBase(BaseModel):
    first_name: str
    last_name: str
    dni: str
    sex: Sex
    birth_date: date
    phone: str | None = None
    email: EmailStr | None = None
    address: str | None = None
    occupation: str | None = None
    insurance: str | None = None
    responsible_person: str | None = None
    photo_url: str | None = None
    observations: str | None = None


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    dni: str | None = None
    sex: Sex | None = None
    birth_date: date | None = None
    phone: str | None = None
    email: EmailStr | None = None
    address: str | None = None
    occupation: str | None = None
    insurance: str | None = None
    responsible_person: str | None = None
    photo_url: str | None = None
    observations: str | None = None


class PatientRead(PatientBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    public_id: str
    created_at: datetime
    updated_at: datetime


class PatientList(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    public_id: str
    first_name: str
    last_name: str
    dni: str
    birth_date: date
    phone: str | None = None
    photo_url: str | None = None


class PaginatedPatients(BaseModel):
    items: list[PatientList]
    total: int
    page: int
    size: int
