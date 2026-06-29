from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.clinical_history import ClinicalHistory
from app.repositories.patient import PatientRepository
from app.schemas.clinical_history import ClinicalHistoryUpdate


class ClinicalHistoryService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.patients = PatientRepository(db)

    def _ensure_patient(self, patient_id: int) -> None:
        if self.patients.get(patient_id) is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found"
            )

    def _get(self, patient_id: int) -> ClinicalHistory | None:
        stmt = select(ClinicalHistory).where(
            ClinicalHistory.patient_id == patient_id
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def get_or_create(self, patient_id: int) -> ClinicalHistory:
        self._ensure_patient(patient_id)
        history = self._get(patient_id)
        if history is None:
            history = ClinicalHistory(patient_id=patient_id)
            self.db.add(history)
            self.db.commit()
            self.db.refresh(history)
        return history

    def upsert(
        self, patient_id: int, data: ClinicalHistoryUpdate
    ) -> ClinicalHistory:
        self._ensure_patient(patient_id)
        history = self._get(patient_id)
        if history is None:
            history = ClinicalHistory(patient_id=patient_id)
            self.db.add(history)
        for field, value in data.model_dump().items():
            setattr(history, field, value)
        self.db.commit()
        self.db.refresh(history)
        return history
