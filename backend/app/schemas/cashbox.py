from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import CashMovementType, PaymentMethod


class CashMovementBase(BaseModel):
    movement_type: CashMovementType
    concept: str
    amount: float = Field(gt=0)
    payment_method: PaymentMethod = PaymentMethod.CASH
    movement_date: date
    patient_id: int | None = None
    treatment_id: int | None = None
    notes: str | None = None


class CashMovementCreate(CashMovementBase):
    pass


class CashMovementRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    movement_type: CashMovementType
    concept: str
    amount: float
    payment_method: PaymentMethod
    movement_date: date
    patient_id: int | None = None
    patient_name: str | None = None
    treatment_id: int | None = None
    notes: str | None = None
    created_at: datetime


class MethodBreakdown(BaseModel):
    payment_method: PaymentMethod
    total: float


class CashSummary(BaseModel):
    date_from: date
    date_to: date
    total_income: float
    total_expense: float
    balance: float
    income_by_method: list[MethodBreakdown]
    movement_count: int
