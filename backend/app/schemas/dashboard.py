"""
Dashboard schemas — response models for dashboard statistics.
"""

from pydantic import BaseModel


class UserDashboardStats(BaseModel):
    """Personal statistics for a regular user."""
    loans_total: int
    loans_active: int
    loans_returned: int
    cubicles_used: int
    events_attended: int


class StaffDashboardStats(BaseModel):
    """Operational statistics for library staff."""
    total_books: int
    active_loans: int
    total_visitors_today: int
    upcoming_events: int
    cubicles_available: int
    cubicles_occupied: int
    cubicles_maintenance: int


class AdminDashboardStats(BaseModel):
    """System-wide statistics for administrators."""
    # Staff metrics
    total_books: int
    active_loans: int
    total_visitors_today: int
    upcoming_events: int
    cubicles_available: int
    cubicles_occupied: int
    cubicles_maintenance: int
    
    # Admin specific metrics
    total_users: int
    total_staff: int
