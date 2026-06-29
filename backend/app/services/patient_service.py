from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.patient import Patient
from app.repositories.patient import PatientRepository
from app.schemas.patient import PatientCreate, PatientUpdate


class PatientService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = PatientRepository(db)

    def search(self, query: str | None, page: int, size: int):
        skip = (page - 1) * size
        items, total = self.repo.search(query, skip, size)
        return items, total

    def get(self, patient_id: int) -> Patient:
        patient = self.repo.get(patient_id)
        if patient is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found"
            )
        return patient

    def get_by_public_id(self, public_id: str) -> Patient:
        patient = self.repo.get_by_public_id(public_id)
        if patient is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found"
            )
        return patient

    def create(self, data: PatientCreate) -> Patient:
        if self.repo.get_by_dni(data.dni):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A patient with this DNI already exists",
            )
        patient = Patient(**data.model_dump())
        self.repo.create(patient)
        self.db.commit()
        self.db.refresh(patient)
        return patient

    def update(self, patient_id: int, data: PatientUpdate) -> Patient:
        patient = self.get(patient_id)
        update_data = data.model_dump(exclude_unset=True)
        if "dni" in update_data and update_data["dni"] != patient.dni:
            existing = self.repo.get_by_dni(update_data["dni"])
            if existing and existing.id != patient.id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="A patient with this DNI already exists",
                )
        for field, value in update_data.items():
            setattr(patient, field, value)
        self.db.commit()
        self.db.refresh(patient)
        return patient

    def delete(self, patient_id: int) -> None:
        patient = self.get(patient_id)
        self.repo.delete(patient)
        self.db.commit()
