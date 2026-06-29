from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.cashbox import CashMovement
from app.models.enums import CashMovementType
from app.models.treatment import Treatment
from app.repositories.patient import PatientRepository
from app.schemas.account import (
    AccountPayment,
    AccountTreatment,
    PatientAccount,
)


class AccountService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.patients = PatientRepository(db)

    def get(self, patient_id: int) -> PatientAccount:
        # Garantiza que el paciente existe (404 si no).
        if self.patients.get(patient_id) is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found"
            )

        treatments = list(
            self.db.execute(
                select(Treatment)
                .where(Treatment.patient_id == patient_id)
                .order_by(
                    Treatment.treatment_date.desc().nullslast(),
                    Treatment.created_at.desc(),
                )
            )
            .scalars()
            .all()
        )

        # Monto pagado por tratamiento (ingresos enlazados por treatment_id).
        ids = [t.id for t in treatments]
        paid_map: dict[int, float] = {}
        if ids:
            rows = self.db.execute(
                select(
                    CashMovement.treatment_id,
                    func.coalesce(func.sum(CashMovement.amount), 0),
                )
                .where(
                    CashMovement.treatment_id.in_(ids),
                    CashMovement.movement_type == CashMovementType.INCOME,
                )
                .group_by(CashMovement.treatment_id)
            ).all()
            paid_map = {tid: float(total) for tid, total in rows}

        account_treatments: list[AccountTreatment] = []
        total_charged = 0.0
        for t in treatments:
            cost = float(t.cost)
            paid = paid_map.get(t.id, 0.0)
            total_charged += cost
            account_treatments.append(
                AccountTreatment(
                    id=t.id,
                    procedure=t.procedure,
                    tooth_fdi=t.tooth_fdi,
                    status=t.status,
                    treatment_date=t.treatment_date,
                    cost=cost,
                    paid=paid,
                    pending=max(cost - paid, 0.0),
                )
            )

        # Historial de pagos: todos los ingresos asociados al paciente.
        payment_rows = list(
            self.db.execute(
                select(CashMovement)
                .where(
                    CashMovement.patient_id == patient_id,
                    CashMovement.movement_type == CashMovementType.INCOME,
                )
                .order_by(
                    CashMovement.movement_date.desc(),
                    CashMovement.id.desc(),
                )
            )
            .scalars()
            .all()
        )
        payments = [
            AccountPayment(
                id=m.id,
                movement_date=m.movement_date,
                concept=m.concept,
                amount=float(m.amount),
                payment_method=m.payment_method,
                treatment_id=m.treatment_id,
            )
            for m in payment_rows
        ]

        total_paid = sum(p.amount for p in payments)

        return PatientAccount(
            total_charged=total_charged,
            total_paid=total_paid,
            balance=total_charged - total_paid,
            treatments=account_treatments,
            payments=payments,
        )
