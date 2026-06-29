from datetime import date

from fastapi import APIRouter, File, Form, UploadFile, status

from app.api.deps import CurrentUser, DbSession
from app.schemas.radiograph import RadiographRead
from app.services.radiograph_service import RadiographService

router = APIRouter(tags=["radiographs"])


@router.get(
    "/patients/{patient_id}/radiographs", response_model=list[RadiographRead]
)
def list_radiographs(
    db: DbSession, _: CurrentUser, patient_id: int
) -> list[RadiographRead]:
    return RadiographService(db).list(patient_id)


@router.post(
    "/patients/{patient_id}/radiographs",
    response_model=RadiographRead,
    status_code=status.HTTP_201_CREATED,
)
async def upload_radiograph(
    db: DbSession,
    _: CurrentUser,
    patient_id: int,
    file: UploadFile = File(...),
    title: str = Form(""),
    taken_on: date | None = Form(None),
    notes: str | None = Form(None),
) -> RadiographRead:
    return await RadiographService(db).upload(
        patient_id, file, title, taken_on, notes
    )


@router.delete(
    "/radiographs/{radiograph_id}", status_code=status.HTTP_204_NO_CONTENT
)
def delete_radiograph(db: DbSession, _: CurrentUser, radiograph_id: int) -> None:
    RadiographService(db).delete(radiograph_id)
