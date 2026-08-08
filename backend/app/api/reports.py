"""
Reports endpoints.

Phase 11 will implement:
- GET    /api/reports/preview      — Generate report data (with date/service filters)
- GET    /api/reports/export       — Export report as XLSX
"""

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse

from app.core.dependencies import DBDep, require_staff
from app.schemas.report import ReportPreviewResponse
from app.services.report_service import get_report_data, export_report_excel

# Apply require_staff to all endpoints in this router
router = APIRouter(dependencies=[Depends(require_staff)])

@router.get("/preview", response_model=ReportPreviewResponse, summary="Preview report")
async def preview_report(
    db: DBDep,
    type: str = Query(..., description="Report type: loans, cubicles, visitors, events, activities"),
    start_date: str | None = Query(None),
    end_date: str | None = Query(None),
    limit: int = Query(100)
):
    """Generate preview report data."""
    columns, rows = get_report_data(db, report_type=type, start_date=start_date, end_date=end_date, limit=limit)
    return ReportPreviewResponse(columns=columns, rows=rows)

@router.get("/export", summary="Export report as Excel")
async def export_report(
    db: DBDep,
    type: str = Query(..., description="Report type"),
    start_date: str | None = Query(None),
    end_date: str | None = Query(None)
):
    """Generate and download XLSX file."""
    buffer = export_report_excel(db, report_type=type, start_date=start_date, end_date=end_date)
    
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=reporte_{type}.xlsx"}
    )
