"""
Activities / Services endpoints.

Phase 10 will implement:
- GET    /api/activities          — List activities (with filters)
- POST   /api/activities          — Register activity (staff/admin)
- GET    /api/activities/stats    — Activity statistics
- GET    /api/activities/user/{id} — Activities by user
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/", summary="List activities")
async def list_activities():
    """Placeholder — will list activities."""
    return {"message": "Activities endpoint — Phase 10"}
