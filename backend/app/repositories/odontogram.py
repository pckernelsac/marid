from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.enums import ToothSurface
from app.models.odontogram import Odontogram, OdontogramEntry
from app.repositories.base import BaseRepository


class OdontogramRepository(BaseRepository[Odontogram]):
    def __init__(self, db: Session) -> None:
        super().__init__(Odontogram, db)

    def get_by_patient(self, patient_id: int) -> Odontogram | None:
        stmt = (
            select(Odontogram)
            .where(Odontogram.patient_id == patient_id)
            .options(selectinload(Odontogram.entries))
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def get_or_create(self, patient_id: int) -> Odontogram:
        odontogram = self.get_by_patient(patient_id)
        if odontogram is None:
            odontogram = Odontogram(patient_id=patient_id)
            self.db.add(odontogram)
            self.db.flush()
        return odontogram

    def find_entry(
        self, odontogram_id: int, tooth_fdi: str, surface: ToothSurface
    ) -> OdontogramEntry | None:
        stmt = select(OdontogramEntry).where(
            OdontogramEntry.odontogram_id == odontogram_id,
            OdontogramEntry.tooth_fdi == tooth_fdi,
            OdontogramEntry.surface == surface,
        )
        return self.db.execute(stmt).scalar_one_or_none()
