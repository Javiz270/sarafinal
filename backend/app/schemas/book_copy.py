"""
Book copy (ejemplar) schemas.
"""

from pydantic import BaseModel


class BookCopyResponse(BaseModel):
    """Book copy details."""
    id: str
    barcode: str
    resource_id: str
    book_title: str | None = None
    book_author: str | None = None
    cover_url: str | None = None
    status: str  # "available" | "loaned" | "maintenance" | "lost"


class BookCopyCreateRequest(BaseModel):
    """Register a new book copy."""
    barcode: str
    resource_id: str


class BookCopyStatusUpdate(BaseModel):
    """Update copy status."""
    status: str  # "available" | "loaned" | "maintenance" | "lost"
