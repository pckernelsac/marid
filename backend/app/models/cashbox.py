from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin
from app.models.enums import CashMovementType, PaymentMethod


class CashMovement(Base, TimestampMixin):
    __tablename__ = "cash_movements"

    id: Mapped[int] = mapped_column(primary_key=True)
    movement_type: Mapped[CashMovementType] = mapped_column(nullable=False)
    concept: Mapped[str] = mapped_column(String(255), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    payment_method: Mapped[PaymentMethod] = mapped_column(
        default=PaymentMethod.CASH, nullable=False
    )
    movement_date: Mapped[date] = mapped_column(Date, index=True, nullable=False)
    patient_id: Mapped[int | None] = mapped_column(
        ForeignKey("patients.id", ondelete="SET NULL"), index=True
    )
    treatment_id: Mapped[int | None] = mapped_column(
        ForeignKey("treatments.id", ondelete="SET NULL")
    )
    registered_by_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL")
    )
    notes: Mapped[str | None] = mapped_column(Text)

    patient = relationship("Patient")
    registered_by = relationship("User")
