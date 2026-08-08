"""
Loan schemas.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class LoanResponse(BaseModel):
    """Loan details directly matching the DB schema."""
    id: str
    resource_id: str
    book_copy_id: Optional[str] = None
    user_id: str
    registered_by: str
    loan_date: datetime
    due_date: datetime
    return_date: Optional[datetime] = None
    status: str  # "active" | "returned" | "overdue"
    notes: Optional[str] = None


class LoanWithDetailsResponse(LoanResponse):
    """Loan response enriched with user and book details."""
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    user_career: Optional[str] = None
    user_group: Optional[str] = None
    
    resource_title: Optional[str] = None
    resource_author: Optional[str] = None
    cover_url: Optional[str] = None
    
    copy_barcode: Optional[str] = None


class LoanCreateRequest(BaseModel):
    """Create a new loan."""
    user_id: str
    barcode: str  # Staff scans the barcode
    due_date: datetime
    notes: Optional[str] = None


class LoanReturnRequest(BaseModel):
    """Register a return."""
    notes: Optional[str] = None


class BarcodeLookupResponse(BaseModel):
    """Response when scanning a barcode before checkout."""
    copy_id: str
    barcode: str
    status: str  # "available" | "loaned" | "lost" ...
    resource_id: str
    title: str
    author: Optional[str] = None
    cover_url: Optional[str] = None
    isbn: Optional[str] = None
