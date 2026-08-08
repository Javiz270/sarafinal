"""
User schemas — models for user management.
"""

from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserProfile(BaseModel):
    """User profile response."""
    id: str
    email: EmailStr
    full_name: str | None = None
    avatar_url: str | None = None
    career: str | None = None
    group: str | None = None
    role: str = "user"
    created_at: datetime | None = None


class UserUpdate(BaseModel):
    """User profile update request."""
    full_name: str | None = None
    career: str | None = None
    group: str | None = None
    avatar_url: str | None = None


class UserRoleUpdate(BaseModel):
    """Admin-only: update a user's role."""
    role: str  # "user" | "staff" | "admin"


class UserStats(BaseModel):
    """User statistics."""
    loans_total: int = 0
    loans_active: int = 0
    loans_returned: int = 0
    cubicles_used: int = 0
    events_attended: int = 0
    activities_total: int = 0
