from datetime import date

from fastapi import APIRouter, Query, status

from app.api.deps import CurrentUser, DbSession
from app.models.enums import CashMovementType
from app.schemas.cashbox import (
    CashMovementCreate,
    CashMovementRead,
    CashSummary,
)
from app.services.cashbox_service import CashboxService

router = APIRouter(prefix="/cash", tags=["cashbox"])


@router.get("/movements", response_model=list[CashMovementRead])
def list_movements(
    db: DbSession,
    _: CurrentUser,
    date_from: date = Query(alias="from"),
    date_to: date = Query(alias="to"),
    type: CashMovementType | None = Query(default=None),
) -> list[CashMovementRead]:
    return CashboxService(db).list_movements(date_from, date_to, type)


@router.post(
    "/movements", response_model=CashMovementRead, status_code=status.HTTP_201_CREATED
)
def create_movement(
    db: DbSession, current_user: CurrentUser, data: CashMovementCreate
) -> CashMovementRead:
    return CashboxService(db).create(data, current_user.id)


@router.delete("/movements/{movement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_movement(db: DbSession, _: CurrentUser, movement_id: int) -> None:
    CashboxService(db).delete(movement_id)


@router.get("/summary", response_model=CashSummary)
def summary(
    db: DbSession,
    _: CurrentUser,
    date_from: date = Query(alias="from"),
    date_to: date = Query(alias="to"),
) -> CashSummary:
    return CashboxService(db).summary(date_from, date_to)
