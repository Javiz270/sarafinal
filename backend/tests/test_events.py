"""
Event tests — Phase 9.
"""

from unittest.mock import MagicMock
import pytest
from fastapi import status
from datetime import datetime, timezone

from app.core.dependencies import get_db, require_staff, get_current_user, CurrentUser
from app.main import app

EV_UUID_1 = "00000000-0000-0000-0000-000000000001"
USER_UUID_1 = "00000000-0000-0000-0000-000000000002"
STAFF_UUID_1 = "00000000-0000-0000-0000-000000000003"
ATT_UUID_1 = "00000000-0000-0000-0000-000000000004"

@pytest.fixture
def setup_dependencies():
    old_overrides = app.dependency_overrides.copy()
    yield app.dependency_overrides
    app.dependency_overrides = old_overrides


def test_list_events_success(client, setup_dependencies):
    """Verify any logged in user can see list of events."""
    mock_db = MagicMock()
    
    mock_execute = MagicMock()
    mock_execute.data = [{
        "id": EV_UUID_1,
        "name": "Feria del Libro",
        "description": "Una feria de libros",
        "event_type": "fair",
        "location": "Auditorio",
        "start_time": datetime.utcnow().isoformat(),
        "end_time": None,
        "created_by": STAFF_UUID_1,
        "created_at": datetime.utcnow().isoformat(),
        "attendee_count": [{"count": 5}]
    }]
    
    mock_db.table.return_value.select.return_value.order.return_value.execute.return_value = mock_execute
    setup_dependencies[get_db] = lambda: mock_db
    setup_dependencies[get_current_user] = lambda: CurrentUser(id=USER_UUID_1, role="user", email="user@utr.edu.mx")

    response = client.get("/api/events/")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()[0]["name"] == "Feria del Libro"
    assert response.json()[0]["attendee_count"] == 5


def test_create_event_success(client, setup_dependencies):
    """Verify staff can create a new event."""
    mock_db = MagicMock()
    
    mock_exec_ev = MagicMock()
    mock_exec_ev.data = [{
        "id": EV_UUID_1,
        "name": "Conferencia AI",
        "description": "Sobre inteligencia artificial",
        "event_type": "conference",
        "location": "Aula Magna",
        "start_time": datetime.utcnow().isoformat(),
        "end_time": None,
        "created_by": STAFF_UUID_1,
        "created_at": datetime.utcnow().isoformat()
    }]
    
    def mock_table(table_name):
        mock_tbl = MagicMock()
        if table_name == "events":
            mock_tbl.insert.return_value.execute = MagicMock(return_value=mock_exec_ev)
        elif table_name == "activities":
            mock_tbl.insert.return_value.execute = MagicMock()
        return mock_tbl
        
    mock_db.table.side_effect = mock_table
    setup_dependencies[get_db] = lambda: mock_db
    setup_dependencies[require_staff] = lambda: CurrentUser(id=STAFF_UUID_1, role="staff", email="staff@utr.edu.mx")
    setup_dependencies[get_current_user] = lambda: CurrentUser(id=STAFF_UUID_1, role="staff", email="staff@utr.edu.mx")

    payload = {
        "name": "Conferencia AI",
        "description": "Sobre inteligencia artificial",
        "event_type": "conference",
        "location": "Aula Magna",
        "start_time": datetime.utcnow().isoformat()
    }

    response = client.post("/api/events/", json=payload)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["name"] == "Conferencia AI"
