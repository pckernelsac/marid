from datetime import date

from pydantic import BaseModel


class NamedCount(BaseModel):
    label: str
    count: int


class NamedAmount(BaseModel):
    label: str
    amount: float


class DayPoint(BaseModel):
    day: date
    income: float
    expense: float


class ReportSummary(BaseModel):
    date_from: date
    date_to: date

    total_patients: int
    new_patients: int

    treatments_total: int
    treatments_by_status: list[NamedCount]
    top_procedures: list[NamedCount]

    appointments_total: int
    appointments_by_status: list[NamedCount]

    total_income: float
    total_expense: float
    balance: float
    income_by_method: list[NamedAmount]
    revenue_series: list[DayPoint]
