from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin
from app.models.enums import AppointmentStatus


class Appointment(Base, TimestampMixin):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(
        ForeignKey("patients.id", ondelete="CASCADE"), index=True, nullable=False
    )
    dentist_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), index=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    appointment_type: Mapped[str | None] = mapped_column(String(80))
    color: Mapped[str | None] = mapped_column(String(9))
    starts_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False), index=True, nullable=False
    )
    ends_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False), nullable=False
    )
    status: Mapped[AppointmentStatus] = mapped_column(
        default=AppointmentStatus.SCHEDULED, nullable=False
    )
    notes: Mapped[str | None] = mapped_column(Text)

    patient = relationship("Patient", back_populates="appointments")
    dentist = relationship("User", back_populates="appointments")
