"""
Cubicle tests — Phase 5.
"""

from unittest.mock import MagicMock
import pytest
from fastapi import status
from datetime import datetime

from app.core.dependencies import get_db, require_staff, get_current_user, CurrentUser
from app.main import app

CUB_UUID_1 = "00000000-0000-0000-0000-000000000001"
USER_UUID_1 = "00000000-0000-0000-0000-000000000002"
STAFF_UUID_1 = "00000000-0000-0000-0000-000000000003"
RES_UUID_1 = "00000000-0000-0000-0000-000000000004"

@pytest.fixture
def setup_dependencies():
    old_overrides = app.dependency_overrides.copy()
    yield app.dependency_overrides
    app.dependency_overrides = old_overrides


def test_list_cubicles(client, setup_dependencies):
    """Verify any user can view cubicle list."""
    mock_db = MagicMock()
    
    mock_cubs = MagicMock()
    mock_cubs.data = [{
        "id": CUB_UUID_1,
        "code": "CUB-01",
        "name": "Sala de Estudio 1",
        "capacity": 4,
        "status": "available"
    }]
    
    mock_res = MagicMock()
    mock_res.data = []  # no active reservations
    
    def mock_table(table_name):
        mock_tbl = MagicMock()
        if table_name == "cubicles":
            mock_tbl.select.return_value.order.return_value.execute = MagicMock(return_value=mock_cubs)
        elif table_name == "cubicle_reservations":
            mock_tbl.select.return_value.eq.return_value.execute = MagicMock(return_value=mock_res)
        return mock_tbl

    mock_db.table.side_effect = mock_table
    setup_dependencies[get_db] = lambda: mock_db
    setup_dependencies[get_current_user] = lambda: CurrentUser(id=USER_UUID_1, role="user", email="user@utr.edu.mx")

    response = client.get("/api/cubicles/")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()[0]["code"] == "CUB-01"


def test_occupy_cubicle_success(client, setup_dependencies):
    """Verify staff can reserve an available cubicle for a user."""
    mock_db = MagicMock()
    
    mock_cub_data = MagicMock()
    mock_cub_data.data = [{
        "id": CUB_UUID_1,
        "code": "CUB-01",
        "name": "Sala de Estudio 1",
        "capacity": 4,
        "status": "available"
    }]
    
    mock_user_data = MagicMock()
    mock_user_data.data = [{"id": USER_UUID_1}]
    
    mock_res_insert = MagicMock()
    mock_res_insert.data = [{
        "id": RES_UUID_1,
        "cubicle_id": CUB_UUID_1,
        "user_id": USER_UUID_1,
        "registered_by": STAFF_UUID_1,
        "start_time": datetime.utcnow().isoformat(),
        "end_time": None,
        "status": "active",
        "notes": "Testing note"
    }]
    
    def mock_table(table_name):
        mock_tbl = MagicMock()
        if table_name == "cubicles":
            mock_tbl.select.return_value.eq.return_value.execute = MagicMock(return_value=mock_cub_data)
            mock_tbl.update.return_value.eq.return_value.execute = MagicMock()
        elif table_name == "profiles":
            mock_tbl.select.return_value.eq.return_value.execute = MagicMock(return_value=mock_user_data)
        elif table_name == "cubicle_reservations":
            mock_tbl.insert.return_value.execute = MagicMock(return_value=mock_res_insert)
        return mock_tbl

    mock_db.table.side_effect = mock_table
    setup_dependencies[get_db] = lambda: mock_db
    setup_dependencies[require_staff] = lambda: CurrentUser(id=STAFF_UUID_1, role="staff", email="staff@utr.edu.mx")
    setup_dependencies[get_current_user] = lambda: CurrentUser(id=STAFF_UUID_1, role="staff", email="staff@utr.edu.mx")

    payload = {
        "user_id": USER_UUID_1,
        "notes": "Testing note"
    }

    response = client.post(f"/api/cubicles/{CUB_UUID_1}/occupy", json=payload)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["status"] == "active"
