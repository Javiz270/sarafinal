"""
Book and resource tests — Phase 6.
"""

from unittest.mock import MagicMock
import pytest
from fastapi import status
from datetime import datetime

from app.core.dependencies import get_db, require_staff, get_current_user, CurrentUser
from app.main import app

RES_UUID_1 = "00000000-0000-0000-0000-000000000001"
RES_UUID_2 = "00000000-0000-0000-0000-000000000002"
COPY_UUID_1 = "00000000-0000-0000-0000-000000000003"
USER_UUID_1 = "00000000-0000-0000-0000-000000000004"

@pytest.fixture
def setup_dependencies():
    old_overrides = app.dependency_overrides.copy()
    yield app.dependency_overrides
    app.dependency_overrides = old_overrides


def test_list_resources(client, setup_dependencies):
    """Verify any logged-in user can list/search resources."""
    mock_db = MagicMock()
    mock_exec = MagicMock()
    mock_exec.data = [{
        "id": RES_UUID_1,
        "title": "Clean Code",
        "author": "Robert C. Martin",
        "isbn": "9780132350884",
        "description": "A Handbook of Agile Software Craftsmanship",
        "publisher": "Prentice Hall",
        "published_year": 2008,
        "cover_url": "https://example.com/cover.jpg",
        "google_books_id": None,
        "copies_total": 2,
        "copies_available": 2,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }]
    
    mock_db.table.return_value.select.return_value.order.return_value.execute.return_value = mock_exec
    setup_dependencies[get_db] = lambda: mock_db
    setup_dependencies[get_current_user] = lambda: CurrentUser(id=USER_UUID_1, role="user", email="user@utr.edu.mx")

    response = client.get("/api/resources/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Clean Code"


def test_create_resource_staff(client, setup_dependencies):
    """Verify staff can add a new resource to the catalog."""
    mock_db = MagicMock()
    mock_exec = MagicMock()
    mock_exec.data = [{
        "id": RES_UUID_2,
        "title": "Design Patterns",
        "author": "Gang of Four",
        "isbn": "9780201633610",
        "description": "Elements of Reusable Object-Oriented Software",
        "publisher": "Addison-Wesley",
        "published_year": 1994,
        "cover_url": "https://example.com/cover.jpg",
        "google_books_id": None,
        "copies_total": 0,
        "copies_available": 0,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }]
    
    mock_db.table.return_value.insert.return_value.execute.return_value = mock_exec
    setup_dependencies[get_db] = lambda: mock_db
    setup_dependencies[require_staff] = lambda: CurrentUser(id="staff-1", role="staff", email="staff@utr.edu.mx")
    setup_dependencies[get_current_user] = lambda: CurrentUser(id="staff-1", role="staff", email="staff@utr.edu.mx")

    payload = {
        "title": "Design Patterns",
        "author": "Gang of Four",
        "isbn": "9780201633610",
        "publisher": "Addison-Wesley",
        "published_year": 1994,
        "description": "Elements of Reusable Object-Oriented Software",
        "cover_url": "https://example.com/cover.jpg"
    }

    response = client.post("/api/resources/", json=payload)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["id"] == RES_UUID_2


def test_create_resource_forbidden_for_user(client, setup_dependencies):
    """Verify standard users cannot create resources."""
    setup_dependencies[get_current_user] = lambda: CurrentUser(id=USER_UUID_1, role="user", email="user@utr.edu.mx")
    from fastapi import HTTPException
    def raise_forbidden():
        raise HTTPException(status_code=403, detail="No tienes permisos de personal.")
    setup_dependencies[require_staff] = raise_forbidden

    payload = {
        "title": "Illegal Book",
        "author": "Hacker",
        "isbn": "1234567890"
    }

    response = client.post("/api/resources/", json=payload)
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_add_book_copy_success(client, setup_dependencies):
    """Verify staff can register a new physical book copy."""
    mock_db = MagicMock()
    
    mock_exec_res = MagicMock()
    mock_exec_res.data = [{
        "id": RES_UUID_1,
        "copies_total": 0,
        "copies_available": 0
    }]
    
    mock_exec_copy_check = MagicMock()
    mock_exec_copy_check.data = [] # barcode not exists
    
    mock_exec_copy_insert = MagicMock()
    mock_exec_copy_insert.data = [{
        "id": COPY_UUID_1,
        "resource_id": RES_UUID_1,
        "barcode": "CAS-101",
        "status": "available",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }]
    
    def mock_table(table_name):
        mock_tbl = MagicMock()
        if table_name == "resources":
            mock_tbl.select.return_value.eq.return_value.execute = MagicMock(return_value=mock_exec_res)
            mock_tbl.update.return_value.eq.return_value.execute = MagicMock()
        elif table_name == "book_copies":
            mock_tbl.select.return_value.eq.return_value.execute = MagicMock(return_value=mock_exec_copy_check)
            mock_tbl.insert.return_value.execute = MagicMock(return_value=mock_exec_copy_insert)
        return mock_tbl
        
    mock_db.table.side_effect = mock_table
    setup_dependencies[get_db] = lambda: mock_db
    setup_dependencies[require_staff] = lambda: CurrentUser(id="staff-1", role="staff", email="staff@utr.edu.mx")
    setup_dependencies[get_current_user] = lambda: CurrentUser(id="staff-1", role="staff", email="staff@utr.edu.mx")

    response = client.post(f"/api/resources/{RES_UUID_1}/copies", json={"barcode": "CAS-101"})
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["barcode"] == "CAS-101"
