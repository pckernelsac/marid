from datetime import date

from pydantic import BaseModel

from app.models.enums import PaymentMethod, TreatmentStatus


class AccountTreatment(BaseModel):
    id: int
    procedure: str
    tooth_fdi: str | None = None
    status: TreatmentStatus
    treatment_date: date | None = None
    cost: float
    paid: float
    pending: float


class AccountPayment(BaseModel):
    id: int
    movement_date: date
    concept: str
    amount: float
    payment_method: PaymentMethod
    treatment_id: int | None = None


class PatientAccount(BaseModel):
    total_charged: float
    total_paid: float
    balance: float
    treatments: list[AccountTreatment]
    payments: list[AccountPayment]
