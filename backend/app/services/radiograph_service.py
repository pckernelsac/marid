import uuid
from datetime import date
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.radiograph import Radiograph
from app.repositories.patient import PatientRepository
from app.repositories.radiograph import RadiographRepository

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "pdf"}


class RadiographService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = RadiographRepository(db)
        self.patients = PatientRepository(db)
        self.upload_dir = Path(settings.UPLOAD_DIR) / "radiographs"
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def _ensure_patient(self, patient_id: int) -> None:
        if self.patients.get(patient_id) is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found"
            )

    def list(self, patient_id: int) -> list[Radiograph]:
        self._ensure_patient(patient_id)
        return self.repo.list_for_patient(patient_id)

    async def upload(
        self,
        patient_id: int,
        file: UploadFile,
        title: str,
        taken_on: date | None,
        notes: str | None,
    ) -> Radiograph:
        self._ensure_patient(patient_id)

        ext = (file.filename or "").rsplit(".", 1)[-1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"Unsupported file type. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
            )

        contents = await file.read()
        max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
        if len(contents) > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds {settings.MAX_UPLOAD_MB} MB",
            )

        filename = f"{uuid.uuid4().hex}.{ext}"
        path = self.upload_dir / filename
        path.write_bytes(contents)

        radiograph = Radiograph(
            patient_id=patient_id,
            title=title or (file.filename or "Radiografía"),
            file_url=f"/uploads/radiographs/{filename}",
            file_type=ext,
            taken_on=taken_on,
            notes=notes,
        )
        self.db.add(radiograph)
        self.db.commit()
        self.db.refresh(radiograph)
        return radiograph

    def delete(self, radiograph_id: int) -> None:
        radiograph = self.repo.get(radiograph_id)
        if radiograph is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Radiograph not found"
            )
        # remove physical file (best-effort)
        try:
            file_path = Path(settings.UPLOAD_DIR) / radiograph.file_url.replace(
                "/uploads/", "", 1
            )
            file_path.unlink(missing_ok=True)
        except Exception:
            pass
        self.repo.delete(radiograph)
        self.db.commit()
