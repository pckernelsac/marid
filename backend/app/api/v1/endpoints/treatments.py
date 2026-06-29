from fastapi import APIRouter, Query, status

from app.api.deps import CurrentUser, DbSession
from app.models.enums import TreatmentStatus
from app.schemas.treatment import (
    PaginatedTreatments,
    TreatmentCreate,
    TreatmentRead,
    TreatmentUpdate,
)
from app.services.treatment_service import TreatmentService

router = APIRouter(prefix="/treatments", tags=["treatments"])


@router.get("", response_model=PaginatedTreatments)
def list_treatments(
    db: DbSession,
    _: CurrentUser,
    patient_id: int | None = Query(default=None),
    status: TreatmentStatus | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
) -> PaginatedTreatments:
    items, total = TreatmentService(db).search(patient_id, status, page, size)
    return PaginatedTreatments(items=items, total=total, page=page, size=size)


@router.post("", response_model=TreatmentRead, status_code=status.HTTP_201_CREATED)
def create_treatment(
    db: DbSession, _: CurrentUser, data: TreatmentCreate
) -> TreatmentRead:
    return TreatmentService(db).create(data)


@router.get("/{treatment_id}", response_model=TreatmentRead)
def get_treatment(db: DbSession, _: CurrentUser, treatment_id: int) -> TreatmentRead:
    return TreatmentService(db).get_read(treatment_id)


@router.patch("/{treatment_id}", response_model=TreatmentRead)
def update_treatment(
    db: DbSession, _: CurrentUser, treatment_id: int, data: TreatmentUpdate
) -> TreatmentRead:
    return TreatmentService(db).update(treatment_id, data)


@router.delete("/{treatment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_treatment(db: DbSession, _: CurrentUser, treatment_id: int) -> None:
    TreatmentService(db).delete(treatment_id)
