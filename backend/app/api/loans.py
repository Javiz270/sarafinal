"""
Loans endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends
from supabase._async.client import AsyncClient

from app.core.dependencies import get_db, get_current_user, require_staff, CurrentUser
from app.schemas.loan import (
    LoanCreateRequest, 
    LoanReturnRequest, 
    LoanWithDetailsResponse,
    BarcodeLookupResponse
)
from app.services import loan_service

router = APIRouter()


@router.get("/by-barcode/{barcode}", response_model=BarcodeLookupResponse, summary="Lookup book copy by barcode")
async def lookup_barcode(
    barcode: str,
    db: AsyncClient = Depends(get_db),
    user: CurrentUser = Depends(require_staff)
):
    """Staff looks up a book copy before creating a loan."""
    return loan_service.get_by_barcode(db, barcode)


@router.post("/", response_model=dict, summary="Create a new loan")
async def create_loan(
    req: LoanCreateRequest,
    db: AsyncClient = Depends(get_db),
    user: CurrentUser = Depends(require_staff)
):
    """Staff creates a loan for a user."""
    loan_id = loan_service.create_loan(db, req, registered_by=user.id)
    return {"id": loan_id, "message": "Préstamo generado correctamente"}


@router.post("/{loan_id}/return", summary="Register return")
async def return_loan(
    loan_id: str,
    req: LoanReturnRequest,
    db: AsyncClient = Depends(get_db),
    user: CurrentUser = Depends(require_staff)
):
    """Staff registers a book return."""
    loan_service.return_loan(db, loan_id, req.notes, registered_by=user.id)
    return {"message": "Devolución registrada correctamente"}


@router.get("/", response_model=List[LoanWithDetailsResponse], summary="List loans")
async def list_loans(
    status: Optional[str] = None,
    db: AsyncClient = Depends(get_db),
    user: CurrentUser = Depends(require_staff)
):
    """Staff lists all loans, optionally filtered by status."""
    return loan_service.get_loans(db, status=status)


@router.get("/my", response_model=List[LoanWithDetailsResponse], summary="Get my loans")
async def my_loans(
    status: Optional[str] = None,
    db: AsyncClient = Depends(get_db),
    user: CurrentUser = Depends(get_current_user)
):
    """User views their own loans."""
    return loan_service.get_loans(db, status=status, user_id=user.id)


@router.get("/{loan_id}", response_model=LoanWithDetailsResponse, summary="Get loan details")
async def get_loan(
    loan_id: str,
    db: AsyncClient = Depends(get_db),
    user: CurrentUser = Depends(get_current_user)
):
    """Get specific loan details. Users can only see their own, staff can see all."""
    loan = loan_service.get_loan(db, loan_id)
    # Check permissions if not staff
    if user.role == "user" and loan.user_id != user.id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="No tienes permiso para ver este préstamo")
    return loan
