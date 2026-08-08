"""
Statistics schemas.
"""

from datetime import datetime
from pydantic import BaseModel


class CubicleStats(BaseModel):
    name: str
    code: str
    uses: int


class BookRequestStats(BaseModel):
    title: str
    author: str | None = None
    loans_count: int


class LoanStats(BaseModel):
    total: int
    active: int
    returned: int
    overdue: int
    popular_books: list[BookRequestStats]


class VisitorStats(BaseModel):
    today: int
    period_total: int
    currently_inside: int
    reasons: dict[str, int]


class EventPopularityStats(BaseModel):
    id: str
    name: str
    attendees_count: int


class EventStats(BaseModel):
    completed: int
    upcoming: int
    total_attendees: int
    popular_events: list[EventPopularityStats]


class GlobalStatisticsResponse(BaseModel):
    period: str
    start_date: datetime
    end_date: datetime
    cubicles: list[CubicleStats]
    loans: LoanStats
    visitors: VisitorStats
    events: EventStats
