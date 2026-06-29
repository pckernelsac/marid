from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession
from app.models.clinic import ClinicSettings
from app.schemas.clinic import ClinicSettingsRead, ClinicSettingsUpdate

router = APIRouter(prefix="/clinic", tags=["clinic"])


def _get_or_create(db) -> ClinicSettings:
    settings = db.query(ClinicSettings).first()
    if settings is None:
        settings = ClinicSettings(name="Madrid Dental Studio")
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("", response_model=ClinicSettingsRead)
def get_clinic(db: DbSession, _: CurrentUser) -> ClinicSettingsRead:
    return _get_or_create(db)


@router.put("", response_model=ClinicSettingsRead)
def update_clinic(
    db: DbSession, _: CurrentUser, data: ClinicSettingsUpdate
) -> ClinicSettingsRead:
    settings = _get_or_create(db)
    for field, value in data.model_dump().items():
        setattr(settings, field, value)
    db.commit()
    db.refresh(settings)
    return settings
