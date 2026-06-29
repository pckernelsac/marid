from datetime import date, datetime

from sqlalchemy import (
    Date,
    DateTime,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin
from app.models.enums import ToothCondition, ToothSurface


class Odontogram(Base, TimestampMixin):
    """One odontogram per patient. Holds the current state of every surface."""

    __tablename__ = "odontograms"

    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(
        ForeignKey("patients.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    patient = relationship("Patient", back_populates="odontogram")
    entries = relationship(
        "OdontogramEntry",
        back_populates="odontogram",
        cascade="all, delete-orphan",
    )


class OdontogramEntry(Base, TimestampMixin):
    """Current clinical state of a single surface of a single tooth (FDI)."""

    __tablename__ = "odontogram_entries"
    __table_args__ = (
        UniqueConstraint(
            "odontogram_id", "tooth_fdi", "surface", name="uq_entry_tooth_surface"
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    odontogram_id: Mapped[int] = mapped_column(
        ForeignKey("odontograms.id", ondelete="CASCADE"), index=True, nullable=False
    )
    tooth_fdi: Mapped[str] = mapped_column(String(3), index=True, nullable=False)
    surface: Mapped[ToothSurface] = mapped_column(nullable=False)
    condition: Mapped[ToothCondition] = mapped_column(
        default=ToothCondition.HEALTHY, nullable=False
    )
    color: Mapped[str | None] = mapped_column(String(9))
    diagnosis: Mapped[str | None] = mapped_column(String(255))
    treatment_description: Mapped[str | None] = mapped_column(Text)
    treatment_date: Mapped[date | None] = mapped_column(Date)
    observations: Mapped[str | None] = mapped_column(Text)
    dentist_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL")
    )

    odontogram = relationship("Odontogram", back_populates="entries")
    dentist = relationship("User")
    history = relationship(
        "OdontogramHistory",
        back_populates="entry",
        cascade="all, delete-orphan",
        order_by="desc(OdontogramHistory.changed_at)",
    )


class OdontogramHistory(Base):
    """Immutable audit trail: never deleted. One row per change."""

    __tablename__ = "odontogram_history"

    id: Mapped[int] = mapped_column(primary_key=True)
    entry_id: Mapped[int] = mapped_column(
        ForeignKey("odontogram_entries.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    tooth_fdi: Mapped[str] = mapped_column(String(3), nullable=False)
    surface: Mapped[ToothSurface] = mapped_column(nullable=False)
    previous_condition: Mapped[ToothCondition | None] = mapped_column()
    new_condition: Mapped[ToothCondition] = mapped_column(nullable=False)
    change_description: Mapped[str | None] = mapped_column(Text)
    changed_by_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL")
    )
    changed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    entry = relationship("OdontogramEntry", back_populates="history")
    changed_by = relationship("User")
