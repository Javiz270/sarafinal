"""
Activity / Service schemas.
"""

from datetime import date

from pydantic import BaseModel


class ActivityResponse(BaseModel):
    """Activity record."""
    id: str
    user_id: str
    user_name: str | None = None
    service_type: str  # "cubicle" | "loan" | "computer" | "language" | "event" | "other"
    description: str | None = None
    activity_date: date
    related_id: str | None = None  # cubicle_id, loan_id, event_id, etc.


class ActivityCreateRequest(BaseModel):
    """Register a new activity."""
    service_type: str
    activity_date: date
    user_id: str | None = None
    visitor_id: str | None = None
    description: str | None = None
    related_id: str | None = None
    service_name: str | None = None
