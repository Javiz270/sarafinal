"""
Supabase client initialization.

Provides a singleton admin client (service role key) for server-side operations
that bypass RLS, and a factory for user-scoped clients when needed.
"""

from supabase import create_client, Client

from app.core.config import settings

# ---------------------------------------------------------------------------
# Admin client — bypasses RLS.  Use only for server-side / admin operations.
# ---------------------------------------------------------------------------
_admin_client: Client | None = None


def get_supabase_admin() -> Client:
    """Return the singleton Supabase admin client."""
    global _admin_client
    if _admin_client is None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables."
            )
        _admin_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY,
        )
    return _admin_client
