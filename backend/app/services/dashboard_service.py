"""
Dashboard service — aggregates data for role-specific dashboards.

Responsibilities:
- User dashboard: personal stats, active loans, activity
- Staff dashboard: active loans, total books, upcoming events
- Admin dashboard: everything + user counts
"""

from typing import Any

from supabase import Client

from app.services.user_service import get_user_stats


def get_user_dashboard(db: Client, user_id: str) -> dict[str, Any]:
    """Get personal dashboard stats for a user."""
    # We can reuse the user stats logic
    return get_user_stats(db, user_id)


def get_staff_dashboard(db: Client) -> dict[str, Any]:
    """Get operational dashboard stats for staff."""
    stats = {
        "total_books": 0,
        "active_loans": 0,
        "total_visitors_today": 0,
        "upcoming_events": 0,
        "cubicles_available": 0,
        "cubicles_occupied": 0,
        "cubicles_maintenance": 0,
    }

    try:
        # Total resources (books) in catalog
        result = db.table("resources").select("id", count="exact").execute()
        stats["total_books"] = result.count or 0
    except Exception:
        pass

    try:
        # Active loans count
        result = db.table("loans").select("id, status, due_date").in_("status", ["active", "overdue"]).execute()
        active = 0
        overdue = 0
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        for row in (result.data or []):
            if row["status"] == "overdue":
                overdue += 1
            elif row["status"] == "active":
                due = datetime.fromisoformat(row["due_date"].replace('Z', '+00:00'))
                if now > due:
                    overdue += 1
                else:
                    active += 1
        stats["active_loans"] = active
        stats["overdue_loans"] = overdue
    except Exception:
        pass
        
    try:
        # Total visitors today
        from datetime import datetime, timezone
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        result = db.table("visitors").select("id", count="exact").gte("check_in", f"{today}T00:00:00Z").execute()
        stats["total_visitors_today"] = result.count or 0
    except Exception:
        pass

    try:
        # Upcoming events (start_time >= now)
        from datetime import datetime, timezone
        now_str = datetime.now(timezone.utc).isoformat()
        result = db.table("events").select("id", count="exact").gte("start_time", now_str).execute()
        stats["upcoming_events"] = result.count or 0
    except Exception:
        pass

    try:
        # Cubicles stats
        result = db.table("cubicles").select("status").execute()
        for c in (result.data or []):
            if c["status"] == "available":
                stats["cubicles_available"] += 1
            elif c["status"] == "occupied":
                stats["cubicles_occupied"] += 1
            elif c["status"] == "maintenance":
                stats["cubicles_maintenance"] += 1
    except Exception:
        pass

    return stats


def get_admin_dashboard(db: Client) -> dict[str, Any]:
    """Get system-wide dashboard stats for admin."""
    # Start with staff stats
    stats = get_staff_dashboard(db)
    
    # Add admin specific stats
    stats["total_users"] = 0
    stats["total_staff"] = 0

    try:
        # Total users (all profiles)
        result = db.table("profiles").select("id", count="exact").execute()
        stats["total_users"] = result.count or 0
        
        # Total staff (profiles with role staff or admin)
        result = db.table("profiles").select("id", count="exact").in_("role", ["staff", "admin"]).execute()
        stats["total_staff"] = result.count or 0
    except Exception:
        pass

    return stats
