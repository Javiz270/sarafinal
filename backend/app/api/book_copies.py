"""
Book copies (ejemplares) endpoints.

Phase 6–7 will implement:
- GET    /api/book-copies              — List copies
- GET    /api/book-copies/{barcode}    — Get copy by barcode
- POST   /api/book-copies              — Register a new copy (staff/admin)
- PATCH  /api/book-copies/{id}         — Update copy status (staff/admin)
- GET    /api/book-copies/{id}/history — Copy loan history
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/", summary="List book copies")
async def list_copies():
    """Placeholder — will list book copies."""
    return {"message": "Book copies endpoint — Phase 6"}
