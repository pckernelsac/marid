from datetime import date

from sqlalchemy import Date, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin
from app.models.enums import TreatmentStatus


class Treatment(Base, TimestampMixin):
    __tablename__ = "treatments"

    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(
        ForeignKey("patients.id", ondelete="CASCADE"), index=True, nullable=False
    )
    dentist_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL")
    )
    tooth_fdi: Mapped[str | None] = mapped_column(String(3), index=True)
    diagnosis: Mapped[str] = mapped_column(String(255), nullable=False)
    procedure: Mapped[str] = mapped_column(String(255), nullable=False)
    cost: Mapped[float] = mapped_column(Numeric(10, 2), default=0, nullable=False)
    treatment_date: Mapped[date | None] = mapped_column(Date)
    status: Mapped[TreatmentStatus] = mapped_column(
        default=TreatmentStatus.PENDING, nullable=False
    )
    observations: Mapped[str | None] = mapped_column(Text)

    patient = relationship("Patient", back_populates="treatments")
    dentist = relationship("User", back_populates="treatments")
