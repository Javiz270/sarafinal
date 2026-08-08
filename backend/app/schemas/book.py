"""
Book schemas.
"""

from pydantic import BaseModel


class BookResponse(BaseModel):
    """Book (resource) details."""
    id: str
    title: str
    author: str | None = None
    isbn: str | None = None
    publisher: str | None = None
    published_year: int | None = None
    description: str | None = None
    cover_url: str | None = None
    google_books_id: str | None = None
    copies_total: int = 0
    copies_available: int = 0


class BookCreateRequest(BaseModel):
    """Create a new book (resource)."""
    title: str
    author: str | None = None
    isbn: str | None = None
    publisher: str | None = None
    published_year: int | None = None
    description: str | None = None
    cover_url: str | None = None
    google_books_id: str | None = None


class GoogleBookResult(BaseModel):
    """Result from Google Books API search."""
    google_books_id: str
    title: str
    authors: list[str] = []
    publisher: str | None = None
    published_date: str | None = None
    description: str | None = None
    isbn_10: str | None = None
    isbn_13: str | None = None
    cover_url: str | None = None
    page_count: int | None = None


class GoogleBooksSearchResponse(BaseModel):
    """Response wrapper for Google Books search."""
    total_items: int
    items: list[GoogleBookResult]
