from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.odontogram import Odontogram, OdontogramEntry, OdontogramHistory
from app.repositories.odontogram import OdontogramRepository
from app.repositories.patient import PatientRepository
from app.schemas.odontogram import OdontogramEntryUpsert


class OdontogramService:
    """Handles odontogram state with an immutable change history."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = OdontogramRepository(db)
        self.patients = PatientRepository(db)

    def _ensure_patient(self, patient_id: int) -> None:
        if self.patients.get(patient_id) is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found"
            )

    def get_for_patient(self, patient_id: int) -> Odontogram:
        self._ensure_patient(patient_id)
        odontogram = self.repo.get_or_create(patient_id)
        self.db.commit()
        self.db.refresh(odontogram)
        return odontogram

    def upsert_entry(
        self, patient_id: int, data: OdontogramEntryUpsert, user_id: int
    ) -> OdontogramEntry:
        self._ensure_patient(patient_id)
        odontogram = self.repo.get_or_create(patient_id)

        entry = self.repo.find_entry(odontogram.id, data.tooth_fdi, data.surface)
        previous_condition = entry.condition if entry else None

        if entry is None:
            entry = OdontogramEntry(
                odontogram_id=odontogram.id,
                tooth_fdi=data.tooth_fdi,
                surface=data.surface,
            )
            self.db.add(entry)

        entry.condition = data.condition
        entry.color = data.color
        entry.diagnosis = data.diagnosis
        entry.treatment_description = data.treatment_description
        entry.treatment_date = data.treatment_date
        entry.observations = data.observations
        entry.dentist_id = user_id
        self.db.flush()

        # Immutable history record (never deleted)
        history = OdontogramHistory(
            entry_id=entry.id,
            tooth_fdi=data.tooth_fdi,
            surface=data.surface,
            previous_condition=previous_condition,
            new_condition=data.condition,
            change_description=data.diagnosis or data.treatment_description,
            changed_by_id=user_id,
        )
        self.db.add(history)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def get_entry_history(self, patient_id: int, tooth_fdi: str) -> list[OdontogramHistory]:
        odontogram = self.repo.get_by_patient(patient_id)
        if odontogram is None:
            return []
        from sqlalchemy import select

        stmt = (
            select(OdontogramHistory)
            .where(OdontogramHistory.tooth_fdi == tooth_fdi)
            .join(OdontogramEntry, OdontogramEntry.id == OdontogramHistory.entry_id)
            .where(OdontogramEntry.odontogram_id == odontogram.id)
            .order_by(OdontogramHistory.changed_at.desc())
        )
        return list(self.db.execute(stmt).scalars().all())
