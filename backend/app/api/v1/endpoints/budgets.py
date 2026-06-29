from fastapi import APIRouter, Query, status

from app.api.deps import CurrentUser, DbSession
from app.models.enums import BudgetStatus
from app.schemas.budget import (
    BudgetCreate,
    BudgetListItem,
    BudgetRead,
    BudgetUpdate,
    PaginatedBudgets,
)
from app.services.budget_service import BudgetService

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.get("", response_model=PaginatedBudgets)
def list_budgets(
    db: DbSession,
    _: CurrentUser,
    patient_id: int | None = Query(default=None),
    status: BudgetStatus | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
) -> PaginatedBudgets:
    items, total = BudgetService(db).search(patient_id, status, page, size)
    return PaginatedBudgets(
        items=[BudgetListItem.model_validate(b) for b in items],
        total=total,
        page=page,
        size=size,
    )


@router.post("", response_model=BudgetRead, status_code=status.HTTP_201_CREATED)
def create_budget(db: DbSession, _: CurrentUser, data: BudgetCreate) -> BudgetRead:
    return BudgetService(db).create(data)


@router.get("/{budget_id}", response_model=BudgetRead)
def get_budget(db: DbSession, _: CurrentUser, budget_id: int) -> BudgetRead:
    return BudgetService(db).get(budget_id)


@router.patch("/{budget_id}", response_model=BudgetRead)
def update_budget(
    db: DbSession, _: CurrentUser, budget_id: int, data: BudgetUpdate
) -> BudgetRead:
    return BudgetService(db).update(budget_id, data)


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(db: DbSession, _: CurrentUser, budget_id: int) -> None:
    BudgetService(db).delete(budget_id)
