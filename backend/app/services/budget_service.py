from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.budget import Budget, BudgetItem
from app.models.enums import BudgetStatus
from app.repositories.budget import BudgetRepository
from app.repositories.patient import PatientRepository
from app.schemas.budget import (
    BudgetCreate,
    BudgetItemBase,
    BudgetItemRead,
    BudgetRead,
    BudgetUpdate,
)


class BudgetService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = BudgetRepository(db)
        self.patients = PatientRepository(db)

    @staticmethod
    def _build_items(items: list[BudgetItemBase]) -> tuple[list[BudgetItem], float]:
        objs: list[BudgetItem] = []
        subtotal = 0.0
        for it in items:
            line_total = round(it.quantity * it.unit_price, 2)
            subtotal += line_total
            objs.append(
                BudgetItem(
                    description=it.description,
                    tooth_fdi=it.tooth_fdi,
                    quantity=it.quantity,
                    unit_price=it.unit_price,
                    line_total=line_total,
                )
            )
        return objs, round(subtotal, 2)

    def _to_read(self, b: Budget) -> BudgetRead:
        return BudgetRead(
            id=b.id,
            patient_id=b.patient_id,
            patient_name=b.patient.full_name if b.patient else None,
            code=b.code,
            issue_date=b.issue_date,
            subtotal=float(b.subtotal),
            discount=float(b.discount),
            total=float(b.total),
            status=b.status,
            notes=b.notes,
            items=[
                BudgetItemRead(
                    id=i.id,
                    description=i.description,
                    tooth_fdi=i.tooth_fdi,
                    quantity=i.quantity,
                    unit_price=float(i.unit_price),
                    line_total=float(i.line_total),
                )
                for i in b.items
            ],
            created_at=b.created_at,
        )

    def search(
        self,
        patient_id: int | None,
        status_filter: BudgetStatus | None,
        page: int,
        size: int,
    ):
        items, total = self.repo.search(
            patient_id, status_filter, (page - 1) * size, size
        )
        return items, total

    def get(self, budget_id: int) -> BudgetRead:
        b = self.repo.get_with_items(budget_id)
        if b is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found"
            )
        return self._to_read(b)

    def create(self, data: BudgetCreate) -> BudgetRead:
        if self.patients.get(data.patient_id) is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found"
            )
        items, subtotal = self._build_items(data.items)
        total = max(round(subtotal - data.discount, 2), 0)
        budget = Budget(
            patient_id=data.patient_id,
            code=self.repo.next_code(data.issue_date),
            issue_date=data.issue_date,
            subtotal=subtotal,
            discount=data.discount,
            total=total,
            notes=data.notes,
            items=items,
        )
        self.db.add(budget)
        self.db.commit()
        return self.get(budget.id)

    def update(self, budget_id: int, data: BudgetUpdate) -> BudgetRead:
        budget = self.repo.get_with_items(budget_id)
        if budget is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found"
            )
        if data.issue_date is not None:
            budget.issue_date = data.issue_date
        if data.status is not None:
            budget.status = data.status
        if data.notes is not None:
            budget.notes = data.notes
        if data.items is not None:
            budget.items.clear()
            self.db.flush()
            items, subtotal = self._build_items(data.items)
            budget.items = items
            budget.subtotal = subtotal
        if data.discount is not None:
            budget.discount = data.discount
        budget.total = max(round(float(budget.subtotal) - float(budget.discount), 2), 0)
        self.db.commit()
        return self.get(budget.id)

    def delete(self, budget_id: int) -> None:
        budget = self.repo.get(budget_id)
        if budget is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found"
            )
        self.repo.delete(budget)
        self.db.commit()
