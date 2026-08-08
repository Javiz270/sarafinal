"""
Resources API Router.
Handles endpoints for SARA's catalog and external Google Books search.
"""

from typing import List, Any
from fastapi import APIRouter, Query, Depends

from app.core.dependencies import DBDep, UserDep, require_staff
from app.schemas.resources import (
    ResourceResponse,
    ResourceCreate,
    BookCopyResponse,
    BookCopyCreate,
    GoogleBookSearchResult,
)
from app.services.google_books_service import search_google_books
from app.services.resource_service import (
    search_internal_catalog,
    get_resource,
    add_resource,
    update_resource,
    get_resource_copies,
    add_book_copy,
    get_copy_by_barcode,
)


router = APIRouter()


@router.get("/", response_model=List[ResourceResponse], summary="List or search internal catalog")
async def list_resources(
    user: UserDep, 
    db: DBDep,
    q: str = Query("", description="Search term for title, author, or ISBN")
):
    """
    Search the internal SARA catalog. Available to all users.
    Returns the bibliographic records and availability stats.
    """
    return search_internal_catalog(db, q)


@router.get("/search", summary="Search Google Books API", dependencies=[Depends(require_staff)])
async def search_external(
    user: UserDep,
    db: DBDep,
    q: str = Query(..., description="Query for Google Books")
):
    """
    Search external Google Books API. Staff/Admin only.
    Used to find books to add to the internal catalog.
    """
    items = await search_google_books(q)
    return {"items": items, "totalItems": len(items)}


@router.get("/copies/{barcode}", summary="Get copy by barcode", dependencies=[Depends(require_staff)])
async def get_copy(barcode: str, user: UserDep, db: DBDep):
    """
    Get a physical book copy by its barcode. Staff/Admin only.
    """
    return get_copy_by_barcode(db, barcode)


@router.get("/{resource_id}", response_model=ResourceResponse, summary="Get single resource")
async def get_single_resource(resource_id: str, user: UserDep, db: DBDep):
    """
    Get details of a specific resource from the internal catalog.
    """
    return get_resource(db, resource_id)


@router.patch("/{resource_id}", response_model=ResourceResponse, summary="Update resource", dependencies=[Depends(require_staff)])
async def patch_resource(resource_id: str, data: dict, user: UserDep, db: DBDep):
    """
    Update bibliographic info of a resource. Staff/Admin only.
    """
    return update_resource(db, resource_id, data)


@router.post("/", response_model=ResourceResponse, summary="Add resource to catalog", dependencies=[Depends(require_staff)])
async def create_resource(data: ResourceCreate, user: UserDep, db: DBDep):
    """
    Add a new bibliographic resource to the internal catalog. Staff/Admin only.
    """
    return add_resource(db, data)


@router.get("/{resource_id}/copies", response_model=List[BookCopyResponse], summary="List copies", dependencies=[Depends(require_staff)])
async def get_copies(resource_id: str, user: UserDep, db: DBDep):
    """
    Get all physical copies for a specific resource. Staff/Admin only.
    """
    return get_resource_copies(db, resource_id)


@router.post("/{resource_id}/copies", response_model=BookCopyResponse, summary="Register a copy", dependencies=[Depends(require_staff)])
async def create_copy(resource_id: str, data: BookCopyCreate, user: UserDep, db: DBDep):
    """
    Register a new physical copy (barcode) for a resource. Staff/Admin only.
    Automatically increments the total and available copies counts.
    """
    return add_book_copy(db, resource_id, data)
