"""
Report tests — Phase 11.
"""

from unittest.mock import MagicMock, patch
import pytest
from fastapi import status

from app.core.dependencies import get_db, require_staff, CurrentUser
from app.main import app

STAFF_UUID_1 = "00000000-0000-0000-0000-000000000001"

@pytest.fixture
def setup_dependencies():
    old_overrides = app.dependency_overrides.copy()
    yield app.dependency_overrides
    app.dependency_overrides = old_overrides


def test_preview_reports_success(client, setup_dependencies):
    """Verify staff can preview report data."""
    mock_db = MagicMock()
    
    mock_execute = MagicMock()
    mock_execute.data = [{
        "id": "loan-1",
        "status": "active",
        "loan_date": "2026-08-08T12:00:00Z",
        "due_date": "2026-08-15T12:00:00Z",
        "return_date": None,
        "profiles": {
            "full_name": "Juan Perez",
            "email": "juan@utr.edu.mx"
        },
        "resources": {
            "title": "Clean Code",
            "author": "Robert C. Martin"
        }
    }]
    
    mock_db.table.return_value.select.return_value.execute.return_value = mock_execute
    setup_dependencies[get_db] = lambda: mock_db
    setup_dependencies[require_staff] = lambda: CurrentUser(id=STAFF_UUID_1, role="staff", email="staff@utr.edu.mx")

    response = client.get("/api/reports/preview?type=loans")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "columns" in data
    assert "rows" in data
    assert len(data["rows"]) == 1
    assert data["rows"][0]["Usuario"] == "Juan Perez"


def test_export_reports_success(client, setup_dependencies):
    """Verify staff can export report to Excel."""
    mock_db = MagicMock()
    
    mock_execute = MagicMock()
    mock_execute.data = [{
        "id": "loan-1",
        "status": "active",
        "loan_date": "2026-08-08T12:00:00Z",
        "due_date": "2026-08-15T12:00:00Z",
        "return_date": None,
        "profiles": {
            "full_name": "Juan Perez",
            "email": "juan@utr.edu.mx"
        },
        "resources": {
            "title": "Clean Code",
            "author": "Robert C. Martin"
        }
    }]
    
    mock_db.table.return_value.select.return_value.execute.return_value = mock_execute
    setup_dependencies[get_db] = lambda: mock_db
    setup_dependencies[require_staff] = lambda: CurrentUser(id=STAFF_UUID_1, role="staff", email="staff@utr.edu.mx")

    response = client.get("/api/reports/export?type=loans")
    assert response.status_code == status.HTTP_200_OK
    assert response.headers["content-type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    assert "attachment; filename=reporte_loans.xlsx" in response.headers["content-disposition"]
