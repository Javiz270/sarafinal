"""
User service — business logic for user management.

Responsibilities:
- Fetch user profiles
- Update profiles
- List users (admin)
- Manage roles (admin only)
- Calculate user statistics
"""

from __future__ import annotations

import logging
from typing import Any

from fastapi import HTTPException, status
from supabase import Client

logger = logging.getLogger(__name__)


def get_user_profile(db: Client, user_id: str) -> dict[str, Any]:
    """Fetch a user's profile from the profiles table."""
    result = db.table("profiles").select("*").eq("id", user_id).execute()

    if not result.data or len(result.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil de usuario no encontrado.",
        )

    return result.data[0]


def list_users(
    db: Client,
    search: str | None = None,
    role: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[dict[str, Any]]:
    """List users from the profiles table. Admin only."""
    query = db.table("profiles").select("*")

    if search:
        # Search by name or email
        query = query.or_(
            f"full_name.ilike.%{search}%,email.ilike.%{search}%"
        )

    if role:
        query = query.eq("role", role)

    query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
    result = query.execute()

    return result.data or []


def update_user_profile(
    db: Client,
    user_id: str,
    update_data: dict[str, Any],
) -> dict[str, Any]:
    """
    Update a user's profile. Users can only update their own profile.

    The 'role' field is explicitly excluded — it can only be changed
    via the admin role-update endpoint.
    """
    # Explicitly remove 'role' if someone tries to sneak it in
    update_data.pop("role", None)

    # Filter out None values
    clean_data = {k: v for k, v in update_data.items() if v is not None}

    if not clean_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se proporcionaron datos para actualizar.",
        )

    try:
        result = (
            db.table("profiles")
            .update(clean_data)
            .eq("id", user_id)
            .execute()
        )
    except Exception as exc:
        logger.error("Failed to update profile for user %s: %s", user_id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al actualizar el perfil.",
        ) from exc

    if not result.data or len(result.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil de usuario no encontrado.",
        )

    return result.data[0]


def get_user_stats(db: Client, user_id: str) -> dict[str, Any]:
    """Calculate user statistics from related tables."""
    stats = {
        "loans_total": 0,
        "loans_active": 0,
        "loans_returned": 0,
        "cubicles_used": 0,
        "events_attended": 0,
        "activities_total": 0,
    }

    try:
        # Loans
        loans = db.table("loans").select("id, status").eq("user_id", user_id).execute()
        if loans.data:
            stats["loans_total"] = len(loans.data)
            stats["loans_active"] = sum(
                1 for l in loans.data if l.get("status") == "active"
            )
            stats["loans_returned"] = sum(
                1 for l in loans.data if l.get("status") == "returned"
            )
    except Exception:
        pass

    try:
        # Cubicle reservations
        cubicles = (
            db.table("cubicle_reservations")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .execute()
        )
        stats["cubicles_used"] = cubicles.count or 0
    except Exception:
        pass

    try:
        # Event attendance
        events = (
            db.table("event_attendees")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .execute()
        )
        stats["events_attended"] = events.count or 0
    except Exception:
        pass

    try:
        # Activities
        activities = (
            db.table("activities")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .execute()
        )
        stats["activities_total"] = activities.count or 0
    except Exception:
        pass

    return stats
