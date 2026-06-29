from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import BudgetStatus


class BudgetItemBase(BaseModel):
    description: str
    tooth_fdi: str | None = None
    quantity: int = Field(default=1, ge=1)
    unit_price: float = Field(default=0, ge=0)


class BudgetItemRead(BudgetItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    line_total: float


class BudgetCreate(BaseModel):
    patient_id: int
    issue_date: date
    discount: float = Field(default=0, ge=0)
    notes: str | None = None
    items: list[BudgetItemBase] = []


class BudgetUpdate(BaseModel):
    issue_date: date | None = None
    discount: float | None = Field(default=None, ge=0)
    status: BudgetStatus | None = None
    notes: str | None = None
    items: list[BudgetItemBase] | None = None


class BudgetRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    patient_name: str | None = None
    code: str
    issue_date: date
    subtotal: float
    discount: float
    total: float
    status: BudgetStatus
    notes: str | None = None
    items: list[BudgetItemRead]
    created_at: datetime


class BudgetListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    patient_id: int
    patient_name: str | None = None
    issue_date: date
    total: float
    status: BudgetStatus


class PaginatedBudgets(BaseModel):
    items: list[BudgetListItem]
    total: int
    page: int
    size: int
