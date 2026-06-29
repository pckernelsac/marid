from datetime import date

from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse

from app.api.deps import CurrentUser, DbSession
from app.schemas.report import ReportSummary
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/summary", response_model=ReportSummary)
def report_summary(
    db: DbSession,
    _: CurrentUser,
    date_from: date = Query(alias="from"),
    date_to: date = Query(alias="to"),
) -> ReportSummary:
    return ReportService(db).summary(date_from, date_to)


@router.get("/export.xlsx")
def export_excel(
    db: DbSession,
    _: CurrentUser,
    date_from: date = Query(alias="from"),
    date_to: date = Query(alias="to"),
) -> StreamingResponse:
    from io import BytesIO

    content = ReportService(db).export_excel(date_from, date_to)
    filename = f"reporte_{date_from}_{date_to}.xlsx"
    return StreamingResponse(
        BytesIO(content),
        media_type=(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ),
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
