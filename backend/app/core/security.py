"""
Security utilities — JWT verification and user authentication.

Uses Supabase JWT tokens to authenticate requests.
The JWT secret is obtained from the Supabase Dashboard → Settings → API.

NOTE: Roles are sourced from the profiles table (via dependencies.py),
NOT from JWT metadata, to prevent self-elevation attacks.
"""

from fastapi import HTTPException, Request, status
from jose import JWTError, jwt

from app.core.config import settings


def get_token_from_header(request: Request) -> str:
    """Extract Bearer token from the Authorization header."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticación no proporcionado.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return auth_header.removeprefix("Bearer ").strip()


def verify_supabase_token(token: str) -> dict:
    """
    Verify and decode a Supabase JWT token.

    Returns the decoded payload containing user information.
    """
    if not settings.SUPABASE_JWT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="SUPABASE_JWT_SECRET no está configurado en el servidor.",
        )

    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return payload
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def get_user_id_from_token(payload: dict) -> str:
    """Extract the user ID (sub) from a decoded JWT payload."""
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token no contiene identificador de usuario.",
        )
    return user_id
