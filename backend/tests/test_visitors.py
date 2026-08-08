"""
Visitor tests — Phase 8.
"""

from unittest.mock import MagicMock, patch
import pytest
from fastapi import status
from datetime import datetime

from app.core.dependencies import get_db, require_staff, get_current_user, CurrentUser
from app.main import app

VIS_UUID_1 = "00000000-0000-0000-0000-000000000001"
STAFF_UUID_1 = "00000000-0000-0000-0000-000000000002"

@pytest.fixture
def setup_dependencies():
    old_overrides = app.dependency_overrides.copy()
    yield app.dependency_overrides
    app.dependency_overrides = old_overrides


def test_list_visitors_success(client, setup_dependencies):
    """Verify staff can view list of visitors."""
    mock_db = MagicMock()
    
    mock_execute = MagicMock()
    mock_execute.data = [{
        "id": VIS_UUID_1,
        "full_name": "Juan Perez",
        "email": "juan@example.com",
        "institution": "U.T.R.",
        "reason": "Visita general",
        "check_in": datetime.utcnow().isoformat(),
        "check_out": None,
        "registered_by": STAFF_UUID_1,
        "event_id": None,
        "created_at": datetime.utcnow().isoformat(),
        "profiles": {
            "full_name": "Bibliotecaria Gomez"
        }
    }]
    
    mock_db.table.return_value.select.return_value.order.return_value.execute.return_value = mock_execute
    setup_dependencies[get_db] = lambda: mock_db
    setup_dependencies[require_staff] = lambda: CurrentUser(id=STAFF_UUID_1, role="staff", email="staff@utr.edu.mx")
    setup_dependencies[get_current_user] = lambda: CurrentUser(id=STAFF_UUID_1, role="staff", email="staff@utr.edu.mx")

    response = client.get("/api/visitors/")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()[0]["full_name"] == "Juan Perez"
    assert response.json()[0]["registered_by_name"] == "Bibliotecaria Gomez"


def test_create_visitor_success(client, setup_dependencies):
    """Verify staff can register a visitor's check-in."""
    mock_db = MagicMock()
    
    mock_exec_vis = MagicMock()
    mock_exec_vis.data = [{
        "id": VIS_UUID_1,
        "full_name": "Juan Perez",
        "email": "juan@example.com",
        "institution": "U.T.R.",
        "reason": "Visita general",
        "check_in": datetime.utcnow().isoformat(),
        "check_out": None,
        "registered_by": STAFF_UUID_1,
        "event_id": None,
        "created_at": datetime.utcnow().isoformat()
    }]
    
    def mock_table(table_name):
        mock_tbl = MagicMock()
        if table_name == "visitors":
            mock_tbl.insert.return_value.execute = MagicMock(return_value=mock_exec_vis)
        elif table_name == "activities":
            mock_tbl.insert.return_value.execute = MagicMock()
        return mock_tbl
        
    mock_db.table.side_effect = mock_table
    setup_dependencies[get_db] = lambda: mock_db
    setup_dependencies[require_staff] = lambda: CurrentUser(id=STAFF_UUID_1, role="staff", email="staff@utr.edu.mx")
    setup_dependencies[get_current_user] = lambda: CurrentUser(id=STAFF_UUID_1, role="staff", email="staff@utr.edu.mx")

    payload = {
        "full_name": "Juan Perez",
        "email": "juan@example.com",
        "institution": "U.T.R.",
        "reason": "Visita general"
    }

    response = client.post("/api/visitors/", json=payload)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["full_name"] == "Juan Perez"
