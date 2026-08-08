"""
Statistics endpoints.

- GET    /api/statistics/global   — Get global statistics (staff/admin)
"""

from fastapi import APIRouter, Depends, Query

from app.core.dependencies import DBDep, require_staff
from app.schemas.statistics import GlobalStatisticsResponse
from app.services.statistics_service import get_global_statistics

router = APIRouter(
    dependencies=[Depends(require_staff)],
    responses={
        401: {"description": "No autorizado"},
        403: {"description": "Permisos insuficientes (requiere staff/admin)"},
    },
)


@router.get(
    "/global",
    response_model=GlobalStatisticsResponse,
    summary="Obtener estadísticas globales",
    description="Calcula y devuelve estadísticas de uso de cubículos, préstamos, visitantes y eventos. Solo accesible para Staff/Admin.",
)
async def get_global_stats(
    db: DBDep,
    period: str = Query("month", description="Periodo de tiempo: today, week, month, year, custom"),
    start_date: str | None = Query(None, description="Fecha de inicio (YYYY-MM-DDThh:mm:ssZ) para periodo custom"),
    end_date: str | None = Query(None, description="Fecha de fin (YYYY-MM-DDThh:mm:ssZ) para periodo custom"),
):
    """Get global operational statistics."""
    return get_global_statistics(db, period=period, start_str=start_date, end_str=end_date)
