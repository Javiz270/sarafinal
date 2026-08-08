"""
Loan tests — Phase 7.
"""

from unittest.mock import MagicMock, patch
import pytest
from fastapi import status
from datetime import date

from app.main import app
from app.core.dependencies import get_db, get_current_user, require_staff, CurrentUser

@pytest.fixture
def setup_dependencies():
    # Store old overrides
    old_overrides = app.dependency_overrides.copy()
    yield app.dependency_overrides
    # Restore old overrides
    app.dependency_overrides = old_overrides

def test_lookup_barcode_staff(client, setup_dependencies):
    """Verify staff can lookup a book copy by barcode."""
    mock_db = MagicMock()
    
    mock_execute = MagicMock()
    mock_execute.data = [{
        "id": "copy-uuid-111",
        "barcode": "CAS-001",
        "status": "available",
        "resource_id": "res-uuid-111",
        "resources": {
            "title": "Cien años de soledad",
            "author": "Gabriel García Márquez",
            "cover_url": "https://example.com/cover.jpg",
            "isbn": "978-3-16-148410-0"
        }
    }]
    
    mock_db.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_execute
    mock_db.table.return_value.select.return_value.eq.return_value.execute = MagicMock(return_value=mock_execute)
    
    setup_dependencies[get_db] = lambda: mock_db
    setup_dependencies[require_staff] = lambda: CurrentUser(id="staff-uuid", role="staff", email="staff@utr.edu.mx")
    
    response = client.get("/api/loans/by-barcode/CAS-001")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["copy_id"] == "copy-uuid-111"
    assert data["barcode"] == "CAS-001"
    assert data["title"] == "Cien años de soledad"
    assert data["status"] == "available"

def test_create_loan_success(client, setup_dependencies):
    """Verify staff can successfully create a loan for a user."""
    mock_db = MagicMock()
    
    mock_exec_copy = MagicMock()
    mock_exec_copy.data = [{
        "id": "copy-uuid-111",
        "barcode": "CAS-001",
        "status": "available",
        "resource_id": "res-uuid-111"
    }]
    
    mock_exec_res = MagicMock()
    mock_exec_res.data = [{
        "copies_available": 3,
        "copies_total": 5
    }]
    
    mock_exec_user = MagicMock()
    mock_exec_user.data = [{"id": "user-uuid-123"}]
    
    mock_exec_loan = MagicMock()
    mock_exec_loan.data = [{"id": "loan-uuid-999"}]
    
    def mock_table(table_name):
        mock_tbl = MagicMock()
        if table_name == "book_copies":
            mock_tbl.select.return_value.eq.return_value.execute = MagicMock(return_value=mock_exec_copy)
            mock_tbl.update.return_value.eq.return_value.execute = MagicMock()
        elif table_name == "resources":
            mock_tbl.select.return_value.eq.return_value.execute = MagicMock(return_value=mock_exec_res)
            mock_tbl.update.return_value.eq.return_value.execute = MagicMock()
        elif table_name == "profiles":
            mock_tbl.select.return_value.eq.return_value.execute = MagicMock(return_value=mock_exec_user)
        elif table_name == "loans":
            mock_tbl.insert.return_value.execute = MagicMock(return_value=mock_exec_loan)
        elif table_name == "activities":
            mock_tbl.insert.return_value.execute = MagicMock()
        return mock_tbl
        
    mock_db.table.side_effect = mock_table
    
    setup_dependencies[get_db] = lambda: mock_db
    setup_dependencies[require_staff] = lambda: CurrentUser(id="staff-uuid", role="staff", email="staff@utr.edu.mx")
    
    loan_payload = {
        "user_id": "user-uuid-123",
        "barcode": "CAS-001",
        "due_date": "2026-08-15"
    }
    
    response = client.post("/api/loans/", json=loan_payload)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == "loan-uuid-999"
    assert "Préstamo generado correctamente" in data["message"]

def test_return_loan_success(client, setup_dependencies):
    """Verify staff can register a return for an active loan."""
    mock_db = MagicMock()
    
    mock_exec_loan = MagicMock()
    mock_exec_loan.data = [{
        "id": "loan-uuid-999",
        "status": "active",
        "book_copy_id": "copy-uuid-111",
        "resource_id": "res-uuid-111",
        "user_id": "user-uuid-123",
        "notes": "Original notes"
    }]
    
    mock_exec_res = MagicMock()
    mock_exec_res.data = [{
        "copies_available": 2,
        "copies_total": 5
    }]
    
    def mock_table(table_name):
        mock_tbl = MagicMock()
        if table_name == "loans":
            mock_tbl.select.return_value.eq.return_value.execute = MagicMock(return_value=mock_exec_loan)
            mock_tbl.update.return_value.eq.return_value.execute = MagicMock()
        elif table_name == "resources":
            mock_tbl.select.return_value.eq.return_value.execute = MagicMock(return_value=mock_exec_res)
            mock_tbl.update.return_value.eq.return_value.execute = MagicMock()
        elif table_name == "book_copies":
            mock_tbl.update.return_value.eq.return_value.execute = MagicMock()
        elif table_name == "activities":
            mock_tbl.insert.return_value.execute = MagicMock()
        return mock_tbl
        
    mock_db.table.side_effect = mock_table
    
    setup_dependencies[get_db] = lambda: mock_db
    setup_dependencies[require_staff] = lambda: CurrentUser(id="staff-uuid", role="staff", email="staff@utr.edu.mx")
    
    response = client.post("/api/loans/loan-uuid-999/return", json={"notes": "Returned in perfect condition"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "Devolución registrada correctamente" in data["message"]
