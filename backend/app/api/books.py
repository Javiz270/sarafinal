"""
Books endpoints.

Phase 6 will implement:
- GET    /api/books              — List registered books
- GET    /api/books/search       — Search books via Google Books API
- GET    /api/books/{id}         — Get book details
- POST   /api/books              — Register a new book (staff/admin)
- PATCH  /api/books/{id}         — Update book info (staff/admin)
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/", summary="List books")
async def list_books():
    """Placeholder — will list registered books."""
    return {"message": "Books endpoint — Phase 6"}


@router.get("/search", summary="Search books")
async def search_books():
    """Placeholder — will search Google Books API."""
    return {"message": "Books search endpoint — Phase 6"}
