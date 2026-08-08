"""
Auth service — business logic for authentication.

Responsibilities:
- Validate institutional email domain (@utr.edu.mx)
- Register users via Supabase Auth
- Handle login
- Create/update profiles in the existing profiles table
- Google OAuth coordination
- Role protection: new users always get role "user"
"""

from __future__ import annotations

import logging
from typing import Any

from fastapi import HTTPException, status
from supabase import Client

logger = logging.getLogger(__name__)

INSTITUTIONAL_DOMAIN = "utr.edu.mx"
VALID_ROLES = {"user", "staff", "admin"}
DEFAULT_ROLE = "user"


def validate_institutional_email(email: str) -> bool:
    """Check that the email belongs to the institutional domain."""
    return email.lower().endswith(f"@{INSTITUTIONAL_DOMAIN}")


def _ensure_institutional_email(email: str) -> None:
    """Raise HTTPException if the email is not institutional."""
    if not validate_institutional_email(email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Solo se permiten correos institucionales @{INSTITUTIONAL_DOMAIN}",
        )


# ---------------------------------------------------------------------------
# Profile management — uses EXISTING 'profiles' table in Supabase
# ---------------------------------------------------------------------------

def ensure_profile_exists(
    db: Client,
    user_id: str,
    email: str,
    full_name: str | None = None,
    avatar_url: str | None = None,
    career: str | None = None,
    group: str | None = None,
) -> dict[str, Any]:
    """
    Ensure a profile row exists for the given user in the existing profiles table.

    If the profile already exists, return it.
    If not, create it with role='user' (never staff/admin on self-registration).
    """
    # Check if profile already exists
    result = db.table("profiles").select("*").eq("id", user_id).execute()

    if result.data and len(result.data) > 0:
        return result.data[0]

    # Create new profile with default role 'user'
    profile_data: dict[str, Any] = {
        "id": user_id,
        "email": email,
        "role": DEFAULT_ROLE,  # Always 'user' — never allow self-assignment of staff/admin
    }
    if full_name:
        profile_data["full_name"] = full_name
    if avatar_url:
        profile_data["avatar_url"] = avatar_url
    if career:
        profile_data["career"] = career
    if group:
        profile_data["group"] = group

    try:
        insert_result = db.table("profiles").insert(profile_data).execute()
        if insert_result.data and len(insert_result.data) > 0:
            logger.info("Profile created for user %s with role '%s'", user_id, DEFAULT_ROLE)
            return insert_result.data[0]
    except Exception as exc:
        logger.error("Failed to create profile for user %s: %s", user_id, exc)
        # If insert fails (e.g., race condition), try fetching again
        result = db.table("profiles").select("*").eq("id", user_id).execute()
        if result.data and len(result.data) > 0:
            return result.data[0]
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al crear el perfil de usuario.",
        ) from exc

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Error al crear el perfil de usuario.",
    )


def get_profile(db: Client, user_id: str) -> dict[str, Any] | None:
    """Fetch the profile for a given user ID."""
    result = db.table("profiles").select("*").eq("id", user_id).execute()
    if result.data and len(result.data) > 0:
        return result.data[0]
    return None


def get_role_from_profile(db: Client, user_id: str) -> str:
    """
    Get the authoritative role from the profiles table.

    This is the source of truth for roles — NOT the JWT metadata.
    Falls back to 'user' if no profile exists.
    """
    profile = get_profile(db, user_id)
    if profile:
        return profile.get("role", DEFAULT_ROLE)
    return DEFAULT_ROLE


# ---------------------------------------------------------------------------
# Registration — Supabase Auth + profile creation
# ---------------------------------------------------------------------------

def register_user(
    db: Client,
    email: str,
    password: str,
    full_name: str,
    career: str | None = None,
    group: str | None = None,
) -> dict[str, Any]:
    """
    Register a new user via Supabase Auth and create their profile.

    Rules:
    - Email must be @utr.edu.mx
    - Role is ALWAYS 'user' — no self-assignment of staff/admin
    - Profile is created in the existing 'profiles' table
    """
    _ensure_institutional_email(email)

    # Validate password strength
    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña debe tener al menos 8 caracteres.",
        )

    try:
        # Create user in Supabase Auth using the admin client (service role)
        auth_response = db.auth.admin.create_user(
            {
                "email": email,
                "password": password,
                "email_confirm": True,  # Auto-confirm since it's an institutional email
                "user_metadata": {
                    "full_name": full_name,
                },
                "app_metadata": {
                    "role": DEFAULT_ROLE,  # Always 'user'
                },
            }
        )
    except Exception as exc:
        error_msg = str(exc)
        if "already been registered" in error_msg or "already exists" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya existe una cuenta con este correo electrónico.",
            ) from exc
        logger.error("Supabase Auth registration error: %s", error_msg)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al registrar el usuario. Intenta de nuevo.",
        ) from exc

    user = auth_response.user
    if not user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al registrar el usuario.",
        )

    # Create profile in existing profiles table
    profile = ensure_profile_exists(
        db=db,
        user_id=user.id,
        email=email,
        full_name=full_name,
        career=career,
        group=group,
    )

    return {
        "user_id": user.id,
        "email": email,
        "role": DEFAULT_ROLE,
        "full_name": full_name,
        "profile": profile,
    }


# ---------------------------------------------------------------------------
# Login — Supabase Auth
# ---------------------------------------------------------------------------

def login_user(db: Client, email: str, password: str) -> dict[str, Any]:
    """
    Authenticate a user with email and password via Supabase Auth.

    Returns the session token and user profile.
    """
    _ensure_institutional_email(email)

    try:
        auth_response = db.auth.sign_in_with_password(
            {"email": email, "password": password}
        )
    except Exception as exc:
        error_msg = str(exc)
        if "Invalid login" in error_msg or "invalid" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Correo o contraseña incorrectos.",
            ) from exc
        logger.error("Supabase Auth login error: %s", error_msg)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos.",
        ) from exc

    session = auth_response.session
    user = auth_response.user

    if not session or not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos.",
        )

    # Ensure profile exists (in case it was created before Phase 2)
    profile = ensure_profile_exists(
        db=db,
        user_id=user.id,
        email=user.email or email,
        full_name=user.user_metadata.get("full_name") if user.user_metadata else None,
    )

    role = profile.get("role", DEFAULT_ROLE)

    return {
        "access_token": session.access_token,
        "refresh_token": session.refresh_token,
        "user_id": user.id,
        "email": user.email or email,
        "role": role,
        "full_name": profile.get("full_name"),
    }


# ---------------------------------------------------------------------------
# Google OAuth — callback handling
# ---------------------------------------------------------------------------

def handle_google_oauth_callback(
    db: Client,
    user_id: str,
    email: str,
    full_name: str | None = None,
    avatar_url: str | None = None,
) -> dict[str, Any]:
    """
    Handle Google OAuth callback: validate domain and ensure profile exists.

    Called after Supabase Auth has verified the Google token.
    The frontend sends the authenticated user info from the Supabase session.
    """
    _ensure_institutional_email(email)

    # Ensure profile exists
    profile = ensure_profile_exists(
        db=db,
        user_id=user_id,
        email=email,
        full_name=full_name,
        avatar_url=avatar_url,
    )

    return {
        "user_id": user_id,
        "email": email,
        "role": profile.get("role", DEFAULT_ROLE),
        "full_name": profile.get("full_name"),
        "avatar_url": profile.get("avatar_url"),
        "profile": profile,
    }


# ---------------------------------------------------------------------------
# Role management — admin only (not self-service)
# ---------------------------------------------------------------------------

def update_user_role(
    db: Client,
    target_user_id: str,
    new_role: str,
    admin_user_id: str,
) -> dict[str, Any]:
    """
    Update a user's role. Only callable by admins.

    The caller must be verified as admin BEFORE calling this function
    (via the require_admin dependency).
    """
    if new_role not in VALID_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Rol inválido. Roles permitidos: {', '.join(sorted(VALID_ROLES))}",
        )

    if target_user_id == admin_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes cambiar tu propio rol.",
        )

    # Check that target user exists
    profile = get_profile(db, target_user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )

    # Update role in profiles table
    try:
        result = (
            db.table("profiles")
            .update({"role": new_role})
            .eq("id", target_user_id)
            .execute()
        )
    except Exception as exc:
        logger.error("Failed to update role for user %s: %s", target_user_id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al actualizar el rol.",
        ) from exc

    if not result.data or len(result.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al actualizar el rol.",
        )

    # Also update app_metadata in Supabase Auth for JWT consistency
    try:
        db.auth.admin.update_user_by_id(
            target_user_id,
            {"app_metadata": {"role": new_role}},
        )
    except Exception as exc:
        logger.warning(
            "Could not update app_metadata for user %s: %s (profile was updated)",
            target_user_id,
            exc,
        )

    logger.info(
        "Admin %s changed role of user %s to '%s'",
        admin_user_id,
        target_user_id,
        new_role,
    )

    return result.data[0]
