from datetime import date, datetime

from pydantic import BaseModel


class DayPoint(BaseModel):
    day: date
    income: float
    expense: float


class NamedAmount(BaseModel):
    label: str
    amount: float


class RecentActivity(BaseModel):
    patient_id: int
    patient_public_id: str
    patient_name: str
    procedure: str
    tooth_fdi: str | None = None
    status: str
    created_at: datetime


class TodayAppointment(BaseModel):
    id: int
    patient_id: int
    patient_name: str
    title: str
    starts_at: datetime
    ends_at: datetime
    status: str
    color: str | None = None


class DashboardSummary(BaseModel):
    # KPIs de hoy
    patients_today: int
    appointments_pending: int
    income_today: float
    treatments_today: int

    # Comparativos / contexto
    income_month: float
    expense_month: float
    balance_month: float
    new_patients_month: int
    total_patients: int

    # Series y listas
    revenue_week: list[DayPoint]
    income_by_method_month: list[NamedAmount]
    recent_activity: list[RecentActivity]
    today_appointments: list[TodayAppointment]
