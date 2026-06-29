from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models.budget import Budget
from app.models.enums import BudgetStatus
from app.repositories.base import BaseRepository


class BudgetRepository(BaseRepository[Budget]):
    def __init__(self, db: Session) -> None:
        super().__init__(Budget, db)

    def get_with_items(self, budget_id: int) -> Budget | None:
        stmt = (
            select(Budget)
            .options(selectinload(Budget.items), joinedload(Budget.patient))
            .where(Budget.id == budget_id)
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def search(
        self,
        patient_id: int | None,
        status: BudgetStatus | None,
        skip: int,
        limit: int,
    ) -> tuple[list[Budget], int]:
        stmt = select(Budget).options(joinedload(Budget.patient))
        count_stmt = select(func.count(Budget.id))
        if patient_id is not None:
            stmt = stmt.where(Budget.patient_id == patient_id)
            count_stmt = count_stmt.where(Budget.patient_id == patient_id)
        if status is not None:
            stmt = stmt.where(Budget.status == status)
            count_stmt = count_stmt.where(Budget.status == status)
        total = self.db.execute(count_stmt).scalar_one()
        stmt = stmt.order_by(Budget.created_at.desc()).offset(skip).limit(limit)
        return list(self.db.execute(stmt).scalars().all()), total

    def next_code(self, today: date) -> str:
        year = today.year
        prefix = f"PRES-{year}-"
        stmt = select(func.count(Budget.id)).where(
            func.extract("year", Budget.issue_date) == year
        )
        seq = self.db.execute(stmt).scalar_one() + 1
        return f"{prefix}{seq:04d}"
