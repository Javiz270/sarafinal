"""
Auth tests — Phase 2 complete test suite.

Tests:
- Health check
- Institutional email validation (@utr.edu.mx)
- Registration endpoint validation
- Login endpoint validation
- Google OAuth endpoint validation
- Domain restriction enforcement
- Role protection (cannot self-assign staff/admin)
- Password validation
"""

from unittest.mock import MagicMock, patch

import pytest
from fastapi import status


# ── Health check ──────────────────────────────────────────────

def test_health_check(client):
    """Verify the health endpoint works."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "sara-backend"


# ── Institutional email validation ────────────────────────────

class TestEmailValidation:
    """Test institutional domain validation."""

    def test_valid_institutional_email(self):
        from app.services.auth_service import validate_institutional_email

        assert validate_institutional_email("alumno@utr.edu.mx") is True
        assert validate_institutional_email("profesor@utr.edu.mx") is True
        assert validate_institutional_email("ADMIN@UTR.EDU.MX") is True
        assert validate_institutional_email("test.user@utr.edu.mx") is True

    def test_invalid_email_domains(self):
        from app.services.auth_service import validate_institutional_email

        assert validate_institutional_email("user@gmail.com") is False
        assert validate_institutional_email("user@hotmail.com") is False
        assert validate_institutional_email("user@outlook.com") is False
        assert validate_institutional_email("user@utr.edu.co") is False
        assert validate_institutional_email("user@other-university.edu.mx") is False
        assert validate_institutional_email("user@utr.com") is False

    def test_empty_email(self):
        from app.services.auth_service import validate_institutional_email

        assert validate_institutional_email("") is False

    def test_partial_domain_match(self):
        """Ensure partial domain matches are rejected."""
        from app.services.auth_service import validate_institutional_email

        assert validate_institutional_email("user@fakeutr.edu.mx") is False
        assert validate_institutional_email("user@notutr.edu.mx") is False


# ── Registration endpoint ─────────────────────────────────────

class TestRegistration:
    """Test registration endpoint validation."""

    def test_register_rejects_non_institutional_email(self, client):
        """Non @utr.edu.mx emails should be rejected."""
        response = client.post("/api/auth/register", json={
            "email": "user@gmail.com",
            "password": "securepass123",
            "full_name": "Test User",
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "utr.edu.mx" in response.json()["detail"]

    def test_register_rejects_short_password(self, client):
        """Passwords shorter than 8 characters should be rejected."""
        response = client.post("/api/auth/register", json={
            "email": "user@utr.edu.mx",
            "password": "short",
            "full_name": "Test User",
        })
        # Pydantic validation or service validation
        assert response.status_code in (
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_422_UNPROCESSABLE_ENTITY,
        )

    def test_register_rejects_empty_name(self, client):
        """Empty full_name should be rejected."""
        response = client.post("/api/auth/register", json={
            "email": "user@utr.edu.mx",
            "password": "securepass123",
            "full_name": "",
        })
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_register_rejects_missing_fields(self, client):
        """Missing required fields should return 422."""
        response = client.post("/api/auth/register", json={
            "email": "user@utr.edu.mx",
        })
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @patch("app.api.auth.register_user")
    def test_register_success_with_institutional_email(self, mock_register, client):
        """Registration with valid @utr.edu.mx email should succeed."""
        mock_register.return_value = {
            "user_id": "test-uuid-123",
            "email": "alumno@utr.edu.mx",
            "role": "user",
            "full_name": "Test Alumno",
            "profile": {},
        }

        response = client.post("/api/auth/register", json={
            "email": "alumno@utr.edu.mx",
            "password": "securepass123",
            "full_name": "Test Alumno",
            "career": "ISC",
            "group": "A",
        })
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["email"] == "alumno@utr.edu.mx"
        assert data["role"] == "user"
        assert data["full_name"] == "Test Alumno"
        assert "message" in data

    @patch("app.api.auth.register_user")
    def test_register_always_assigns_user_role(self, mock_register, client):
        """Registration must always assign role 'user', never staff/admin."""
        mock_register.return_value = {
            "user_id": "test-uuid-456",
            "email": "test@utr.edu.mx",
            "role": "user",  # Always 'user'
            "full_name": "Test User",
            "profile": {},
        }

        response = client.post("/api/auth/register", json={
            "email": "test@utr.edu.mx",
            "password": "securepass123",
            "full_name": "Test User",
        })
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["role"] == "user"


# ── Login endpoint ────────────────────────────────────────────

class TestLogin:
    """Test login endpoint validation."""

    def test_login_rejects_non_institutional_email(self, client):
        """Non @utr.edu.mx emails should be rejected at login."""
        response = client.post("/api/auth/login", json={
            "email": "user@gmail.com",
            "password": "securepass123",
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "utr.edu.mx" in response.json()["detail"]

    @patch("app.api.auth.login_user")
    def test_login_success(self, mock_login, client):
        """Valid login should return token and user info."""
        mock_login.return_value = {
            "access_token": "test-jwt-token",
            "refresh_token": "test-refresh-token",
            "user_id": "test-uuid-789",
            "email": "alumno@utr.edu.mx",
            "role": "user",
            "full_name": "Test Alumno",
        }

        response = client.post("/api/auth/login", json={
            "email": "alumno@utr.edu.mx",
            "password": "securepass123",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["access_token"] == "test-jwt-token"
        assert data["email"] == "alumno@utr.edu.mx"
        assert data["role"] == "user"


# ── Logout endpoint ──────────────────────────────────────────

class TestLogout:
    """Test logout endpoint."""

    def test_logout_returns_message(self, client):
        """Logout should always return a success message."""
        response = client.post("/api/auth/logout")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data


# ── Google OAuth endpoint ─────────────────────────────────────

class TestGoogleOAuth:
    """Test Google OAuth callback endpoint."""

    def test_google_oauth_rejects_non_institutional_email(self, client):
        """Google OAuth should reject non-institutional emails."""
        response = client.post("/api/auth/google", json={
            "user_id": "google-uuid-123",
            "email": "user@gmail.com",
            "full_name": "Gmail User",
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "utr.edu.mx" in response.json()["detail"]

    @patch("app.api.auth.handle_google_oauth_callback")
    def test_google_oauth_success(self, mock_google, client):
        """Valid Google OAuth with @utr.edu.mx should succeed."""
        mock_google.return_value = {
            "user_id": "google-uuid-456",
            "email": "profesor@utr.edu.mx",
            "role": "user",
            "full_name": "Test Profesor",
            "avatar_url": "https://example.com/avatar.jpg",
            "profile": {},
        }

        response = client.post("/api/auth/google", json={
            "user_id": "google-uuid-456",
            "email": "profesor@utr.edu.mx",
            "full_name": "Test Profesor",
            "avatar_url": "https://example.com/avatar.jpg",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "profesor@utr.edu.mx"
        assert data["role"] == "user"


# ── Protected endpoints ───────────────────────────────────────

class TestProtectedEndpoints:
    """Test that protected endpoints require authentication."""

    def test_me_requires_auth(self, client):
        """GET /api/auth/me should require authentication."""
        response = client.get("/api/auth/me")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_users_list_requires_auth(self, client):
        """GET /api/users should require authentication."""
        response = client.get("/api/users/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_role_update_requires_auth(self, client):
        """PATCH /api/users/{id}/role should require authentication."""
        response = client.patch(
            "/api/users/test-uuid/role",
            json={"role": "admin"},
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ── Role protection ───────────────────────────────────────────

class TestRoleProtection:
    """Test role protection in the service layer."""

    def test_default_role_is_user(self):
        """The default role constant must be 'user'."""
        from app.services.auth_service import DEFAULT_ROLE

        assert DEFAULT_ROLE == "user"

    def test_valid_roles_defined(self):
        """Valid roles should be 'user', 'staff', 'admin'."""
        from app.services.auth_service import VALID_ROLES

        assert VALID_ROLES == {"user", "staff", "admin"}

    def test_user_update_strips_role(self):
        """UserUpdate model dump should not include role field."""
        from app.schemas.user import UserUpdate

        update = UserUpdate(full_name="New Name")
        data = update.model_dump(exclude_unset=True)
        assert "role" not in data

    def test_role_update_schema_accepts_valid_roles(self):
        """UserRoleUpdate should accept valid role strings."""
        from app.schemas.user import UserRoleUpdate

        for role in ["user", "staff", "admin"]:
            update = UserRoleUpdate(role=role)
            assert update.role == role
