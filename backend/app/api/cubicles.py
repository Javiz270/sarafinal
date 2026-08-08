"""
Cubicles endpoints.

Provides endpoints for querying and managing cubicles.
Protected by roles as necessary.
"""

from typing import List

from fastapi import APIRouter, Depends

from app.core.dependencies import DBDep, UserDep, require_staff
from app.schemas.cubicles import (
    CubicleReservationRequest,
    CubicleReservationResponse,
    CubicleUsageHistory,
    CubicleWithActiveReservation,
    CubicleBase,
)
from app.services.cubicle_service import (
    get_user_history,
    list_cubicles,
    occupy_cubicle,
    release_cubicle,
    set_maintenance_status,
)

router = APIRouter()


@router.get("/", response_model=List[CubicleWithActiveReservation], summary="List all cubicles")
async def get_all_cubicles(user: UserDep, db: DBDep):
    """List all cubicles and their current state. Available to all authenticated users."""
    return list_cubicles(db)


@router.get("/my-history", response_model=List[CubicleUsageHistory], summary="Get user cubicle history")
async def get_my_cubicle_history(user: UserDep, db: DBDep):
    """List cubicle usage history for the currently authenticated user."""
    return get_user_history(db, user.id)


@router.post(
    "/{cubicle_id}/occupy",
    response_model=CubicleReservationResponse,
    summary="Occupy a cubicle",
    dependencies=[Depends(require_staff)],
)
async def occupy(cubicle_id: str, request: CubicleReservationRequest, user: UserDep, db: DBDep):
    """Assign a cubicle to a user. Staff/Admin only."""
    return occupy_cubicle(
        db=db,
        cubicle_id=cubicle_id,
        user_id=str(request.user_id),
        registered_by=user.id,
        notes=request.notes,
    )


@router.post(
    "/{cubicle_id}/release",
    response_model=CubicleReservationResponse,
    summary="Release a cubicle",
    dependencies=[Depends(require_staff)],
)
async def release(cubicle_id: str, user: UserDep, db: DBDep):
    """Release an occupied cubicle. Staff/Admin only."""
    return release_cubicle(db=db, cubicle_id=cubicle_id, registered_by=user.id)


@router.post(
    "/{cubicle_id}/maintenance",
    response_model=CubicleBase,
    summary="Set cubicle to maintenance",
    dependencies=[Depends(require_staff)],
)
async def set_maintenance(cubicle_id: str, user: UserDep, db: DBDep):
    """Set a cubicle's status to maintenance. Staff/Admin only."""
    return set_maintenance_status(db=db, cubicle_id=cubicle_id, to_maintenance=True)


@router.post(
    "/{cubicle_id}/available",
    response_model=CubicleBase,
    summary="Set cubicle to available",
    dependencies=[Depends(require_staff)],
)
async def set_available(cubicle_id: str, user: UserDep, db: DBDep):
    """Set a cubicle's status back to available. Staff/Admin only."""
    return set_maintenance_status(db=db, cubicle_id=cubicle_id, to_maintenance=False)
