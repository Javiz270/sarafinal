"""
Cubicle schemas.
"""

from datetime import datetime

from pydantic import BaseModel


class CubicleResponse(BaseModel):
    """Cubicle details."""
    id: str
    name: str
    status: str  # "available" | "occupied" | "maintenance"
    assigned_to: str | None = None
    assigned_user_name: str | None = None
    assigned_at: datetime | None = None


class CubicleAssignRequest(BaseModel):
    """Assign a cubicle to a user."""
    user_id: str


class CubicleStatusUpdate(BaseModel):
    """Update cubicle status."""
    status: str  # "available" | "occupied" | "maintenance"


class CubicleUsageRecord(BaseModel):
    """A single cubicle usage record."""
    id: str
    cubicle_id: str
    cubicle_name: str
    user_id: str
    user_name: str | None = None
    started_at: datetime
    ended_at: datetime | None = None


class CubicleStats(BaseModel):
    """Cubicle usage statistics."""
    cubicle_name: str
    usage_count: int
    total_hours: float | None = None
