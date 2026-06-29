from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.radiograph import Radiograph
from app.repositories.base import BaseRepository


class RadiographRepository(BaseRepository[Radiograph]):
    def __init__(self, db: Session) -> None:
        super().__init__(Radiograph, db)

    def list_for_patient(self, patient_id: int) -> list[Radiograph]:
        stmt = (
            select(Radiograph)
            .where(Radiograph.patient_id == patient_id)
            .order_by(
                Radiograph.taken_on.desc().nullslast(),
                Radiograph.created_at.desc(),
            )
        )
        return list(self.db.execute(stmt).scalars().all())
