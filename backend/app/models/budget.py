from datetime import date

from sqlalchemy import Date, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin
from app.models.enums import BudgetStatus


class Budget(Base, TimestampMixin):
    __tablename__ = "budgets"

    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(
        ForeignKey("patients.id", ondelete="CASCADE"), index=True, nullable=False
    )
    code: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    issue_date: Mapped[date] = mapped_column(Date, nullable=False)
    subtotal: Mapped[float] = mapped_column(Numeric(10, 2), default=0, nullable=False)
    discount: Mapped[float] = mapped_column(Numeric(10, 2), default=0, nullable=False)
    total: Mapped[float] = mapped_column(Numeric(10, 2), default=0, nullable=False)
    status: Mapped[BudgetStatus] = mapped_column(
        default=BudgetStatus.DRAFT, nullable=False
    )
    notes: Mapped[str | None] = mapped_column(Text)

    patient = relationship("Patient", back_populates="budgets")
    items = relationship(
        "BudgetItem", back_populates="budget", cascade="all, delete-orphan"
    )


class BudgetItem(Base):
    __tablename__ = "budget_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    budget_id: Mapped[int] = mapped_column(
        ForeignKey("budgets.id", ondelete="CASCADE"), index=True, nullable=False
    )
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    tooth_fdi: Mapped[str | None] = mapped_column(String(3))
    quantity: Mapped[int] = mapped_column(default=1, nullable=False)
    unit_price: Mapped[float] = mapped_column(Numeric(10, 2), default=0, nullable=False)
    line_total: Mapped[float] = mapped_column(Numeric(10, 2), default=0, nullable=False)

    budget = relationship("Budget", back_populates="items")
