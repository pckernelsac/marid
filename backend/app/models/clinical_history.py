from sqlalchemy import Boolean, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class ClinicalHistory(Base, TimestampMixin):
    """Digitises the physical clinical-history form (one per patient)."""

    __tablename__ = "clinical_histories"

    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(
        ForeignKey("patients.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    # Medical antecedents (boolean flags + detail)
    allergies: Mapped[bool] = mapped_column(Boolean, default=False)
    allergies_detail: Mapped[str | None] = mapped_column(Text)
    diabetes: Mapped[bool] = mapped_column(Boolean, default=False)
    hypertension: Mapped[bool] = mapped_column(Boolean, default=False)
    anemia: Mapped[bool] = mapped_column(Boolean, default=False)
    hiv: Mapped[bool] = mapped_column(Boolean, default=False)
    pregnancy: Mapped[bool] = mapped_column(Boolean, default=False)
    hepatitis: Mapped[bool] = mapped_column(Boolean, default=False)
    bleeding_disorders: Mapped[bool] = mapped_column(Boolean, default=False)

    current_medication: Mapped[str | None] = mapped_column(Text)
    medical_antecedents: Mapped[str | None] = mapped_column(Text)
    observations: Mapped[str | None] = mapped_column(Text)

    patient = relationship("Patient", back_populates="clinical_history")
