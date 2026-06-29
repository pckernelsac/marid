from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession
from app.schemas.odontogram import (
    OdontogramEntryRead,
    OdontogramEntryUpsert,
    OdontogramHistoryRead,
    OdontogramRead,
)
from app.services.odontogram_service import OdontogramService

router = APIRouter(prefix="/patients/{patient_id}/odontogram", tags=["odontogram"])


@router.get("", response_model=OdontogramRead)
def get_odontogram(db: DbSession, _: CurrentUser, patient_id: int) -> OdontogramRead:
    return OdontogramService(db).get_for_patient(patient_id)


@router.put("/entries", response_model=OdontogramEntryRead)
def upsert_entry(
    db: DbSession,
    current_user: CurrentUser,
    patient_id: int,
    data: OdontogramEntryUpsert,
) -> OdontogramEntryRead:
    return OdontogramService(db).upsert_entry(patient_id, data, current_user.id)


@router.get("/history/{tooth_fdi}", response_model=list[OdontogramHistoryRead])
def tooth_history(
    db: DbSession, _: CurrentUser, patient_id: int, tooth_fdi: str
) -> list[OdontogramHistoryRead]:
    return OdontogramService(db).get_entry_history(patient_id, tooth_fdi)
