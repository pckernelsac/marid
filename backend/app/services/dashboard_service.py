from datetime import date, datetime, time, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.appointment import Appointment
from app.models.cashbox import CashMovement
from app.models.enums import (
    AppointmentStatus,
    CashMovementType,
    PaymentMethod,
)
from app.models.patient import Patient
from app.models.treatment import Treatment
from app.schemas.dashboard import (
    DashboardSummary,
    DayPoint,
    NamedAmount,
    RecentActivity,
    TodayAppointment,
)

METHOD_LABELS = {
    PaymentMethod.CASH: "Efectivo",
    PaymentMethod.CARD: "Tarjeta",
    PaymentMethod.TRANSFER: "Transferencia",
    PaymentMethod.YAPE: "Yape",
    PaymentMethod.PLIN: "Plin",
    PaymentMethod.OTHER: "Otro",
}

# Estados de cita que cuentan como "pendientes" (aún por atender hoy).
PENDING_APPT_STATUSES = (
    AppointmentStatus.SCHEDULED,
    AppointmentStatus.CONFIRMED,
)


class DashboardService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def summary(self, today: date | None = None) -> DashboardSummary:
        today = today or date.today()
        day_start = datetime.combine(today, time.min)
        day_end = datetime.combine(today, time.max)
        month_start = today.replace(day=1)
        week_start = today - timedelta(days=6)

        # --- Pacientes atendidos hoy (distintos pacientes con cita hoy) ---
        patients_today = self.db.execute(
            select(func.count(func.distinct(Appointment.patient_id))).where(
                Appointment.starts_at >= day_start,
                Appointment.starts_at <= day_end,
            )
        ).scalar_one()

        # --- Citas pendientes hoy (agendadas / confirmadas) ---
        appointments_pending = self.db.execute(
            select(func.count(Appointment.id)).where(
                Appointment.starts_at >= day_start,
                Appointment.starts_at <= day_end,
                Appointment.status.in_(PENDING_APPT_STATUSES),
            )
        ).scalar_one()

        # --- Ingresos de hoy ---
        income_today = self._sum_cash(
            CashMovementType.INCOME, today, today
        )

        # --- Tratamientos de hoy (por fecha de tratamiento) ---
        treatments_today = self.db.execute(
            select(func.count(Treatment.id)).where(
                Treatment.treatment_date == today
            )
        ).scalar_one()

        # --- Contexto del mes ---
        income_month = self._sum_cash(
            CashMovementType.INCOME, month_start, today
        )
        expense_month = self._sum_cash(
            CashMovementType.EXPENSE, month_start, today
        )
        new_patients_month = self.db.execute(
            select(func.count(Patient.id)).where(
                Patient.created_at >= datetime.combine(month_start, time.min),
                Patient.created_at <= day_end,
            )
        ).scalar_one()
        total_patients = self.db.execute(
            select(func.count(Patient.id))
        ).scalar_one()

        # --- Serie de ingresos/egresos de la semana (últimos 7 días) ---
        revenue_week = self._revenue_series(week_start, today)

        # --- Ingresos por método de pago (mes) ---
        income_by_method_month = self._income_by_method(month_start, today)

        # --- Actividad reciente (últimos tratamientos creados) ---
        recent_activity = self._recent_activity()

        # --- Agenda de hoy ---
        today_appointments = self._today_appointments(day_start, day_end)

        return DashboardSummary(
            patients_today=patients_today,
            appointments_pending=appointments_pending,
            income_today=income_today,
            treatments_today=treatments_today,
            income_month=income_month,
            expense_month=expense_month,
            balance_month=income_month - expense_month,
            new_patients_month=new_patients_month,
            total_patients=total_patients,
            revenue_week=revenue_week,
            income_by_method_month=income_by_method_month,
            recent_activity=recent_activity,
            today_appointments=today_appointments,
        )

    # ------------------------------------------------------------------ #
    # Helpers
    # ------------------------------------------------------------------ #
    def _sum_cash(
        self, mtype: CashMovementType, date_from: date, date_to: date
    ) -> float:
        return float(
            self.db.execute(
                select(func.coalesce(func.sum(CashMovement.amount), 0)).where(
                    CashMovement.movement_date >= date_from,
                    CashMovement.movement_date <= date_to,
                    CashMovement.movement_type == mtype,
                )
            ).scalar_one()
        )

    def _revenue_series(
        self, date_from: date, date_to: date
    ) -> list[DayPoint]:
        rows = self.db.execute(
            select(
                CashMovement.movement_date,
                CashMovement.movement_type,
                func.coalesce(func.sum(CashMovement.amount), 0),
            )
            .where(
                CashMovement.movement_date >= date_from,
                CashMovement.movement_date <= date_to,
            )
            .group_by(CashMovement.movement_date, CashMovement.movement_type)
        ).all()

        totals: dict[date, dict[str, float]] = {}
        for d, mtype, amount in rows:
            entry = totals.setdefault(d, {"income": 0.0, "expense": 0.0})
            entry[mtype.value] = float(amount)

        # Rellenar todos los días del rango (incluye días sin movimientos).
        series: list[DayPoint] = []
        cursor = date_from
        while cursor <= date_to:
            v = totals.get(cursor, {"income": 0.0, "expense": 0.0})
            series.append(
                DayPoint(day=cursor, income=v["income"], expense=v["expense"])
            )
            cursor += timedelta(days=1)
        return series

    def _income_by_method(
        self, date_from: date, date_to: date
    ) -> list[NamedAmount]:
        rows = self.db.execute(
            select(
                CashMovement.payment_method,
                func.coalesce(func.sum(CashMovement.amount), 0),
            )
            .where(
                CashMovement.movement_date >= date_from,
                CashMovement.movement_date <= date_to,
                CashMovement.movement_type == CashMovementType.INCOME,
            )
            .group_by(CashMovement.payment_method)
            .order_by(func.sum(CashMovement.amount).desc())
        ).all()
        return [
            NamedAmount(label=METHOD_LABELS.get(m, m.value), amount=float(a))
            for m, a in rows
        ]

    def _recent_activity(self, limit: int = 6) -> list[RecentActivity]:
        rows = self.db.execute(
            select(Treatment, Patient)
            .join(Patient, Treatment.patient_id == Patient.id)
            .order_by(Treatment.created_at.desc())
            .limit(limit)
        ).all()
        return [
            RecentActivity(
                patient_id=t.patient_id,
                patient_public_id=p.public_id,
                patient_name=f"{p.first_name} {p.last_name}",
                procedure=t.procedure,
                tooth_fdi=t.tooth_fdi,
                status=t.status.value,
                created_at=t.created_at,
            )
            for t, p in rows
        ]

    def _today_appointments(
        self, day_start: datetime, day_end: datetime
    ) -> list[TodayAppointment]:
        rows = self.db.execute(
            select(Appointment, Patient)
            .join(Patient, Appointment.patient_id == Patient.id)
            .where(
                Appointment.starts_at >= day_start,
                Appointment.starts_at <= day_end,
            )
            .order_by(Appointment.starts_at)
        ).all()
        return [
            TodayAppointment(
                id=a.id,
                patient_id=a.patient_id,
                patient_name=f"{p.first_name} {p.last_name}",
                title=a.title,
                starts_at=a.starts_at,
                ends_at=a.ends_at,
                status=a.status.value,
                color=a.color,
            )
            for a, p in rows
        ]
