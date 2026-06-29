from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.models.cashbox import CashMovement
from app.models.enums import CashMovementType
from app.schemas.cashbox import (
    CashMovementCreate,
    CashMovementRead,
    CashSummary,
    MethodBreakdown,
)


class CashboxService:
    def __init__(self, db: Session) -> None:
        self.db = db

    @staticmethod
    def _to_read(m: CashMovement) -> CashMovementRead:
        return CashMovementRead(
            id=m.id,
            movement_type=m.movement_type,
            concept=m.concept,
            amount=float(m.amount),
            payment_method=m.payment_method,
            movement_date=m.movement_date,
            patient_id=m.patient_id,
            patient_name=m.patient.full_name if m.patient else None,
            treatment_id=m.treatment_id,
            notes=m.notes,
            created_at=m.created_at,
        )

    def list_movements(
        self,
        date_from: date,
        date_to: date,
        movement_type: CashMovementType | None,
    ) -> list[CashMovementRead]:
        stmt = (
            select(CashMovement)
            .options(joinedload(CashMovement.patient))
            .where(
                CashMovement.movement_date >= date_from,
                CashMovement.movement_date <= date_to,
            )
        )
        if movement_type is not None:
            stmt = stmt.where(CashMovement.movement_type == movement_type)
        stmt = stmt.order_by(
            CashMovement.movement_date.desc(), CashMovement.id.desc()
        )
        return [self._to_read(m) for m in self.db.execute(stmt).scalars().all()]

    def create(
        self, data: CashMovementCreate, user_id: int
    ) -> CashMovementRead:
        movement = CashMovement(**data.model_dump(), registered_by_id=user_id)
        self.db.add(movement)
        self.db.commit()
        self.db.refresh(movement)
        return self._to_read(movement)

    def delete(self, movement_id: int) -> None:
        movement = self.db.get(CashMovement, movement_id)
        if movement is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Movement not found"
            )
        self.db.delete(movement)
        self.db.commit()

    def summary(self, date_from: date, date_to: date) -> CashSummary:
        base = (
            CashMovement.movement_date >= date_from,
            CashMovement.movement_date <= date_to,
        )

        def _sum(mtype: CashMovementType) -> float:
            stmt = select(func.coalesce(func.sum(CashMovement.amount), 0)).where(
                *base, CashMovement.movement_type == mtype
            )
            return float(self.db.execute(stmt).scalar_one())

        income = _sum(CashMovementType.INCOME)
        expense = _sum(CashMovementType.EXPENSE)

        method_stmt = (
            select(
                CashMovement.payment_method,
                func.coalesce(func.sum(CashMovement.amount), 0),
            )
            .where(*base, CashMovement.movement_type == CashMovementType.INCOME)
            .group_by(CashMovement.payment_method)
        )
        by_method = [
            MethodBreakdown(payment_method=pm, total=float(total))
            for pm, total in self.db.execute(method_stmt).all()
        ]

        count = self.db.execute(
            select(func.count(CashMovement.id)).where(*base)
        ).scalar_one()

        return CashSummary(
            date_from=date_from,
            date_to=date_to,
            total_income=income,
            total_expense=expense,
            balance=income - expense,
            income_by_method=by_method,
            movement_count=count,
        )
