from datetime import date

from sqlalchemy import Date, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin
from app.models.enums import Sex


class Patient(Base, TimestampMixin):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(primary_key=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    dni: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    sex: Mapped[Sex] = mapped_column(nullable=False)
    birth_date: Mapped[date] = mapped_column(Date, nullable=False)
    phone: Mapped[str | None] = mapped_column(String(30), index=True)
    email: Mapped[str | None] = mapped_column(String(255), index=True)
    address: Mapped[str | None] = mapped_column(String(255))
    occupation: Mapped[str | None] = mapped_column(String(120))
    insurance: Mapped[str | None] = mapped_column(String(120))
    responsible_person: Mapped[str | None] = mapped_column(String(150))
    photo_url: Mapped[str | None] = mapped_column(String(500))
    observations: Mapped[str | None] = mapped_column(Text)

    # relationships
    clinical_history = relationship(
        "ClinicalHistory",
        back_populates="patient",
        uselist=False,
        cascade="all, delete-orphan",
    )
    odontogram = relationship(
        "Odontogram",
        back_populates="patient",
        uselist=False,
        cascade="all, delete-orphan",
    )
    treatments = relationship(
        "Treatment", back_populates="patient", cascade="all, delete-orphan"
    )
    appointments = relationship(
        "Appointment", back_populates="patient", cascade="all, delete-orphan"
    )
    radiographs = relationship(
        "Radiograph", back_populates="patient", cascade="all, delete-orphan"
    )
    budgets = relationship(
        "Budget", back_populates="patient", cascade="all, delete-orphan"
    )

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
