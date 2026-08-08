"""
Event schemas matching the database structure.
"""

from datetime import datetime
from pydantic import BaseModel, ConfigDict


class EventResponse(BaseModel):
    """Event details."""
    id: str
    name: str
    description: str | None = None
    event_type: str | None = None
    location: str | None = None
    start_time: datetime
    end_time: datetime | None = None
    created_by: str
    created_at: datetime
    attendee_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class EventCreateRequest(BaseModel):
    """Create a new event."""
    name: str
    description: str | None = None
    event_type: str | None = None
    location: str | None = None
    start_time: datetime
    end_time: datetime | None = None


class EventAttendeeRequest(BaseModel):
    """Register an attendee for an event."""
    user_id: str | None = None
    visitor_id: str | None = None


class EventAttendeeResponse(BaseModel):
    """Attendee details."""
    id: str
    event_id: str
    user_id: str | None = None
    visitor_id: str | None = None
    registered_at: datetime
    
    # Extended fields
    user_name: str | None = None
    visitor_name: str | None = None
    visitor_institution: str | None = None

    model_config = ConfigDict(from_attributes=True)
