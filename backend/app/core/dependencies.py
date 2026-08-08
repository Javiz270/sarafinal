"""
FastAPI dependencies — reusable dependency functions for injection via Depends().

Provides:
- Database client injection
- Current authenticated user extraction (with role from profiles table)
- Role-based access control guards
"""

from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from supabase import Client

from app.core.database import get_supabase_admin
from app.core.security import (
    get_token_from_header,
    get_user_id_from_token,
    verify_supabase_token,
)


# ---------------------------------------------------------------------------
# Database dependency
# ---------------------------------------------------------------------------
def get_db() -> Client:
    """Provide the Supabase admin client as a FastAPI dependency."""
    return get_supabase_admin()


DBDep = Annotated[Client, Depends(get_db)]


# ---------------------------------------------------------------------------
# Current user dependency
# ---------------------------------------------------------------------------
class CurrentUser:
    """Represents the currently authenticated user extracted from JWT."""

    def __init__(self, id: str, role: str, email: str | None = None):
        self.id = id
        self.role = role
        self.email = email


async def get_current_user(request: Request, db: DBDep) -> CurrentUser:
    """
    Extract and verify the current user from the request's JWT token.

    The role is sourced from the profiles table (source of truth),
    NOT from JWT metadata, to prevent self-elevation attacks.
    """
    token = get_token_from_header(request)
    payload = verify_supabase_token(token)
    user_id = get_user_id_from_token(payload)
    email = payload.get("email")

    # Get authoritative role from profiles table
    role = "user"  # default
    try:
        result = db.table("profiles").select("role").eq("id", user_id).execute()
        if result.data and len(result.data) > 0:
            role = result.data[0].get("role", "user")
    except Exception:
        # If we can't reach the DB, fall back to JWT metadata
        app_metadata = payload.get("app_metadata", {})
        role = app_metadata.get("role", "user")

    return CurrentUser(id=user_id, role=role, email=email)


UserDep = Annotated[CurrentUser, Depends(get_current_user)]


# ---------------------------------------------------------------------------
# Role guards
# ---------------------------------------------------------------------------
def require_role(*allowed_roles: str):
    """
    Factory that returns a dependency which checks that the current user
    has one of the allowed roles.

    Usage:
        @router.get("/admin-only", dependencies=[Depends(require_role("admin"))])
    """

    async def _guard(user: UserDep) -> CurrentUser:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para realizar esta acción.",
            )
        return user

    return _guard


require_staff = require_role("staff", "admin")
require_admin = require_role("admin")
