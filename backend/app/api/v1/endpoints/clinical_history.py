from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession
from app.schemas.clinical_history import (
    ClinicalHistoryRead,
    ClinicalHistoryUpdate,
)
from app.services.clinical_history_service import ClinicalHistoryService

router = APIRouter(
    prefix="/patients/{patient_id}/clinical-history", tags=["clinical-history"]
)


@router.get("", response_model=ClinicalHistoryRead)
def get_clinical_history(
    db: DbSession, _: CurrentUser, patient_id: int
) -> ClinicalHistoryRead:
    return ClinicalHistoryService(db).get_or_create(patient_id)


@router.put("", response_model=ClinicalHistoryRead)
def update_clinical_history(
    db: DbSession,
    _: CurrentUser,
    patient_id: int,
    data: ClinicalHistoryUpdate,
) -> ClinicalHistoryRead:
    return ClinicalHistoryService(db).upsert(patient_id, data)
