from fastapi import APIRouter, Query, status

from app.api.deps import CurrentUser, DbSession
from app.schemas.account import PatientAccount
from app.schemas.patient import (
    PaginatedPatients,
    PatientCreate,
    PatientList,
    PatientRead,
    PatientUpdate,
)
from app.services.account_service import AccountService
from app.services.patient_service import PatientService

router = APIRouter(prefix="/patients", tags=["patients"])


@router.get("", response_model=PaginatedPatients)
def list_patients(
    db: DbSession,
    _: CurrentUser,
    q: str | None = Query(default=None, description="Instant search query"),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
) -> PaginatedPatients:
    service = PatientService(db)
    items, total = service.search(q, page, size)
    return PaginatedPatients(
        items=[PatientList.model_validate(p) for p in items],
        total=total,
        page=page,
        size=size,
    )


@router.post("", response_model=PatientRead, status_code=status.HTTP_201_CREATED)
def create_patient(db: DbSession, _: CurrentUser, data: PatientCreate) -> PatientRead:
    return PatientService(db).create(data)


@router.get("/by-code/{public_id}", response_model=PatientRead)
def get_patient_by_code(
    db: DbSession, _: CurrentUser, public_id: str
) -> PatientRead:
    return PatientService(db).get_by_public_id(public_id)


@router.get("/{patient_id}/account", response_model=PatientAccount)
def get_patient_account(
    db: DbSession, _: CurrentUser, patient_id: int
) -> PatientAccount:
    return AccountService(db).get(patient_id)


@router.get("/{patient_id}", response_model=PatientRead)
def get_patient(db: DbSession, _: CurrentUser, patient_id: int) -> PatientRead:
    return PatientService(db).get(patient_id)


@router.patch("/{patient_id}", response_model=PatientRead)
def update_patient(
    db: DbSession, _: CurrentUser, patient_id: int, data: PatientUpdate
) -> PatientRead:
    return PatientService(db).update(patient_id, data)


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(db: DbSession, _: CurrentUser, patient_id: int) -> None:
    PatientService(db).delete(patient_id)
