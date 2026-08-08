"""
Auth endpoints.

- POST /api/auth/register  — Register with email + password (@utr.edu.mx only)
- POST /api/auth/login     — Login with email + password
- POST /api/auth/logout    — Logout (client-side, server acknowledges)
- GET  /api/auth/me        — Get current user profile
- POST /api/auth/google    — Google OAuth callback handling
"""

from fastapi import APIRouter, Depends

from app.core.dependencies import DBDep, UserDep
from app.schemas.auth import (
    AuthResponse,
    GoogleOAuthRequest,
    LoginRequest,
    MessageResponse,
    RegisterRequest,
)
from app.services.auth_service import (
    handle_google_oauth_callback,
    login_user,
    register_user,
)
from app.services.user_service import get_user_profile

router = APIRouter()


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=201,
    summary="Registrar usuario",
    description="Registra un nuevo usuario con correo institucional @utr.edu.mx. "
    "El rol asignado siempre es 'user'. No se permite auto-asignación de staff/admin.",
)
async def register(body: RegisterRequest, db: DBDep):
    """Register a new user with institutional email."""
    result = register_user(
        db=db,
        email=body.email,
        password=body.password,
        full_name=body.full_name,
        career=body.career,
        group=body.group,
    )
    return AuthResponse(
        access_token="",  # User must login after registration
        user_id=result["user_id"],
        email=result["email"],
        role=result["role"],
        full_name=result["full_name"],
        message="Cuenta creada exitosamente. Inicia sesión para continuar.",
    )


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Iniciar sesión",
    description="Inicia sesión con correo institucional @utr.edu.mx y contraseña.",
)
async def login(body: LoginRequest, db: DBDep):
    """Login with email and password."""
    result = login_user(db=db, email=body.email, password=body.password)
    return AuthResponse(
        access_token=result["access_token"],
        user_id=result["user_id"],
        email=result["email"],
        role=result["role"],
        full_name=result.get("full_name"),
    )


@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Cerrar sesión",
    description="Cierra la sesión del usuario. El token se invalida en el cliente.",
)
async def logout():
    """
    Logout endpoint.

    Actual session invalidation happens client-side via Supabase JS.
    This endpoint acknowledges the request for API consistency.
    """
    return MessageResponse(message="Sesión cerrada exitosamente.")


@router.get(
    "/me",
    summary="Perfil del usuario actual",
    description="Obtiene el perfil completo del usuario autenticado desde la tabla profiles.",
)
async def get_me(user: UserDep, db: DBDep):
    """Get the authenticated user's profile."""
    profile = get_user_profile(db, user.id)
    return profile


@router.post(
    "/google",
    summary="Google OAuth callback",
    description="Procesa el callback de Google OAuth. Valida el dominio @utr.edu.mx "
    "y crea/actualiza el perfil del usuario. El rol siempre es 'user' para nuevos usuarios.",
)
async def google_oauth(body: GoogleOAuthRequest, db: DBDep):
    """Handle Google OAuth callback."""
    result = handle_google_oauth_callback(
        db=db,
        user_id=body.user_id,
        email=body.email,
        full_name=body.full_name,
        avatar_url=body.avatar_url,
    )
    return {
        "user_id": result["user_id"],
        "email": result["email"],
        "role": result["role"],
        "full_name": result.get("full_name"),
        "avatar_url": result.get("avatar_url"),
    }
