"""
Auth schemas — request and response models for authentication endpoints.
"""

from pydantic import BaseModel, EmailStr, field_validator


class RegisterRequest(BaseModel):
    """Registration request body."""
    email: EmailStr
    password: str
    full_name: str
    career: str | None = None
    group: str | None = None

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres.")
        return v

    @field_validator("full_name")
    @classmethod
    def full_name_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("El nombre completo es obligatorio.")
        return v.strip()


class LoginRequest(BaseModel):
    """Login request body."""
    email: EmailStr
    password: str


class GoogleOAuthRequest(BaseModel):
    """Google OAuth callback request body."""
    user_id: str
    email: EmailStr
    full_name: str | None = None
    avatar_url: str | None = None


class AuthResponse(BaseModel):
    """Authentication response with token and user info."""
    access_token: str
    user_id: str
    email: str
    role: str
    full_name: str | None = None
    message: str | None = None


class MessageResponse(BaseModel):
    """Simple message response."""
    message: str
