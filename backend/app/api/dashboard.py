"""
Dashboard endpoints.

Phase 4: Provides role-specific dashboard statistics.
"""

from fastapi import APIRouter, Depends

from app.core.dependencies import DBDep, UserDep, require_admin, require_staff
from app.schemas.dashboard import (
    AdminDashboardStats,
    StaffDashboardStats,
    UserDashboardStats,
)
from app.services.dashboard_service import (
    get_admin_dashboard,
    get_staff_dashboard,
    get_user_dashboard,
)

router = APIRouter()


@router.get("/user", response_model=UserDashboardStats, summary="User dashboard")
async def user_dashboard_endpoint(user: UserDep, db: DBDep):
    """Return user-specific dashboard data."""
    return get_user_dashboard(db, user.id)


@router.get(
    "/staff",
    response_model=StaffDashboardStats,
    summary="Staff dashboard",
    dependencies=[Depends(require_staff)],
)
async def staff_dashboard_endpoint(user: UserDep, db: DBDep):
    """Return operational dashboard data for staff."""
    return get_staff_dashboard(db)


@router.get(
    "/admin",
    response_model=AdminDashboardStats,
    summary="Admin dashboard",
    dependencies=[Depends(require_admin)],
)
async def admin_dashboard_endpoint(user: UserDep, db: DBDep):
    """Return system-wide dashboard data for admin."""
    return get_admin_dashboard(db)
