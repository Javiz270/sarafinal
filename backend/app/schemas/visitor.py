"""
Visitor schemas matching database.
"""

from datetime import datetime
from pydantic import BaseModel, ConfigDict


class VisitorResponse(BaseModel):
    """Visitor details."""
    id: str
    full_name: str
    email: str | None = None
    institution: str | None = None
    reason: str | None = None
    check_in: datetime
    check_out: datetime | None = None
    registered_by: str
    event_id: str | None = None
    created_at: datetime
    
    # Extended fields from joined profile
    registered_by_name: str | None = None
    
    model_config = ConfigDict(from_attributes=True)


class VisitorCreateRequest(BaseModel):
    """Register a new visitor."""
    full_name: str
    reason: str | None = None
    email: str | None = None
    institution: str | None = None
    event_id: str | None = None
