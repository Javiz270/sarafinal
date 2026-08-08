"""
Core configuration — loads environment variables using pydantic-settings.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    # ── Supabase ──────────────────────────────────────────────
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # ── Google Books ──────────────────────────────────────────
    GOOGLE_BOOKS_API_KEY: str = ""

    # ── CORS ──────────────────────────────────────────────────
    FRONTEND_URL: str = "http://localhost:5173"

    # ── JWT ───────────────────────────────────────────────────
    # Supabase JWT secret — used to verify tokens server-side.
    # Can be found in Supabase Dashboard → Settings → API → JWT Secret.
    SUPABASE_JWT_SECRET: str = ""


settings = Settings()
