"""
Resources and Books schemas.
"""

from typing import List, Optional
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel


# ---------------------------------------------------------
# SARA Internal Catalog Schemas (resources)
# ---------------------------------------------------------
class ResourceBase(BaseModel):
    title: str
    author: Optional[str] = None
    isbn: Optional[str] = None
    description: Optional[str] = None
    publisher: Optional[str] = None
    published_year: Optional[int] = None
    cover_url: Optional[str] = None
    google_books_id: Optional[str] = None


class ResourceCreate(ResourceBase):
    pass


class ResourceResponse(ResourceBase):
    id: UUID
    copies_total: int
    copies_available: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------
# Book Copies Schemas (book_copies)
# ---------------------------------------------------------
class BookCopyBase(BaseModel):
    barcode: str


class BookCopyCreate(BookCopyBase):
    pass


class BookCopyResponse(BookCopyBase):
    id: UUID
    resource_id: UUID
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ResourceWithCopiesResponse(ResourceResponse):
    copies: List[BookCopyResponse] = []


# ---------------------------------------------------------
# Google Books API Schemas
# ---------------------------------------------------------
class GoogleBookVolumeInfo(BaseModel):
    title: str
    authors: Optional[List[str]] = None
    publisher: Optional[str] = None
    publishedDate: Optional[str] = None
    description: Optional[str] = None
    industryIdentifiers: Optional[List[dict]] = None
    imageLinks: Optional[dict] = None


class GoogleBookItem(BaseModel):
    id: str
    volumeInfo: GoogleBookVolumeInfo


class GoogleBookSearchResult(BaseModel):
    items: Optional[List[GoogleBookItem]] = None
    totalItems: int
