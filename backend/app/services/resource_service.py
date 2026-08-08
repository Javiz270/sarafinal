"""
Resource service — manages internal SARA catalog and physical copies.
"""

from typing import Any, List

from fastapi import HTTPException
from supabase import Client

from app.schemas.resources import ResourceCreate, BookCopyCreate


def search_internal_catalog(db: Client, query: str = "") -> List[dict[str, Any]]:
    """Search internal catalog by title, author, or ISBN."""
    q = db.table("resources").select("*").order("title")
    
    if query.strip():
        # Supabase/PostgREST textSearch or simply ilike
        # Since we want to search title or author or isbn, we can use an 'or' filter
        # Format for postgREST or filter: or=(title.ilike.*query*,author.ilike.*query*,isbn.eq.query)
        term = f"%{query.strip()}%"
        q = q.or_(f"title.ilike.{term},author.ilike.{term},isbn.eq.{query.strip()}")
        
    result = q.execute()
    return result.data or []


def get_resource(db: Client, resource_id: str) -> dict[str, Any]:
    """Get a single resource by ID."""
    result = db.table("resources").select("*").eq("id", resource_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Recurso no encontrado.")
    return result.data[0]


def add_resource(db: Client, data: ResourceCreate) -> dict[str, Any]:
    """Add a new bibliographic resource to the internal catalog."""
    insert_data = data.model_dump()
    # Explicitly set copies to 0 for a new resource (though DB default handles it)
    insert_data["copies_total"] = 0
    insert_data["copies_available"] = 0
    
    result = db.table("resources").insert(insert_data).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Error al agregar el recurso.")
    return result.data[0]


def update_resource(db: Client, resource_id: str, data: dict[str, Any]) -> dict[str, Any]:
    """Update a resource's bibliographic information."""
    result = db.table("resources").update(data).eq("id", resource_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Recurso no encontrado.")
    return result.data[0]


def get_resource_copies(db: Client, resource_id: str) -> List[dict[str, Any]]:
    """Get all physical copies for a specific resource."""
    result = db.table("book_copies").select("*").eq("resource_id", resource_id).execute()
    return result.data or []


def add_book_copy(db: Client, resource_id: str, data: BookCopyCreate) -> dict[str, Any]:
    """
    Register a new physical copy (barcode).
    Updates the parent resource copies_total and copies_available.
    """
    # 1. Verify resource exists
    res_query = db.table("resources").select("id, copies_total, copies_available").eq("id", resource_id).execute()
    if not res_query.data:
        raise HTTPException(status_code=404, detail="El recurso bibliográfico no existe.")
    
    resource = res_query.data[0]
    
    # 2. Check if barcode already exists
    copy_check = db.table("book_copies").select("id").eq("barcode", data.barcode).execute()
    if copy_check.data:
        raise HTTPException(status_code=400, detail="Ya existe un ejemplar con ese código de barras.")
        
    # 3. Insert copy
    copy_data = {
        "resource_id": resource_id,
        "barcode": data.barcode,
        "status": "available"
    }
    insert_res = db.table("book_copies").insert(copy_data).execute()
    if not insert_res.data:
        raise HTTPException(status_code=500, detail="Error al registrar el ejemplar.")
        
    new_copy = insert_res.data[0]
    
    # 4. Update parent resource
    new_total = resource["copies_total"] + 1
    new_available = resource["copies_available"] + 1
    db.table("resources").update({
        "copies_total": new_total,
        "copies_available": new_available
    }).eq("id", resource_id).execute()
    
    return new_copy


def get_copy_by_barcode(db: Client, barcode: str) -> dict[str, Any]:
    """Find a physical copy by its barcode and include its resource info."""
    result = (
        db.table("book_copies")
        .select("*, resources(*)")
        .eq("barcode", barcode)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Ejemplar no encontrado con ese código.")
    return result.data[0]
