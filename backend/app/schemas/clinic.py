from pydantic import BaseModel, ConfigDict


class ClinicSettingsBase(BaseModel):
    name: str = "Madrid Dental Studio"
    ruc: str | None = None
    address: str | None = None
    phone: str | None = None
    email: str | None = None
    logo_url: str | None = None
    signature_url: str | None = None
    opening_hours: str | None = None


class ClinicSettingsUpdate(ClinicSettingsBase):
    pass


class ClinicSettingsRead(ClinicSettingsBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
