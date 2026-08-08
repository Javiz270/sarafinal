"""
Cubicles schemas.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class CubicleBase(BaseModel):
    id: UUID
    code: str
    name: str
    capacity: int
    status: str


class CubicleReservationRequest(BaseModel):
    user_id: UUID
    notes: Optional[str] = None


class CubicleReservationResponse(BaseModel):
    id: UUID
    cubicle_id: UUID
    user_id: UUID
    registered_by: UUID
    start_time: datetime
    end_time: Optional[datetime] = None
    status: str
    notes: Optional[str] = None
    
    class Config:
        from_attributes = True


class UserProfileBasic(BaseModel):
    id: UUID
    full_name: str
    email: str


class CubicleWithActiveReservation(CubicleBase):
    active_reservation: Optional[CubicleReservationResponse] = None
    active_user: Optional[UserProfileBasic] = None


class CubicleUsageHistory(BaseModel):
    id: UUID
    cubicle_name: str
    start_time: datetime
    end_time: Optional[datetime] = None
    status: str
    notes: Optional[str] = None
