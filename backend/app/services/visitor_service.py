"""
Visitor service — business logic for visitors.
"""

from datetime import datetime, timezone
from supabase import Client
from fastapi import HTTPException

from app.schemas.visitor import VisitorCreateRequest, VisitorResponse
from app.schemas.activity import ActivityCreateRequest
from app.services.activity_service import log_activity


def list_visitors(db: Client, date_filter: str | None = None, search: str | None = None, reason: str | None = None, inside_only: bool = False) -> list[dict]:
    """List visitors with optional filters."""
    query = db.table("visitors").select("*, profiles:registered_by(full_name)")
    
    if inside_only:
        query = query.is_("check_out", "null")
    
    if search:
        query = query.ilike("full_name", f"%{search}%")
        
    if reason:
        query = query.eq("reason", reason)
        
    if date_filter:
        # Assuming date_filter is YYYY-MM-DD
        query = query.gte("check_in", f"{date_filter}T00:00:00Z").lt("check_in", f"{date_filter}T23:59:59Z")
        
    query = query.order("check_in", desc=True)
    
    response = query.execute()
    
    # Process joined profiles
    result = []
    for row in (response.data or []):
        if row.get("profiles"):
            row["registered_by_name"] = row["profiles"].get("full_name")
        else:
            row["registered_by_name"] = None
        result.append(row)
        
    return result


def create_visitor(db: Client, req: VisitorCreateRequest, registered_by: str) -> dict:
    """Register a new visitor."""
    now = datetime.now(timezone.utc)
    
    data = {
        "full_name": req.full_name,
        "email": req.email,
        "institution": req.institution,
        "reason": req.reason,
        "event_id": req.event_id,
        "check_in": now.isoformat(),
        "registered_by": registered_by
    }
    
    response = db.table("visitors").insert(data).execute()
    
    if not response.data:
        raise HTTPException(status_code=500, detail="Error al registrar el visitante.")
        
    visitor = response.data[0]
    
    # If event_id is provided, register them as event attendee
    if req.event_id:
        try:
            db.table("event_attendees").insert({
                "event_id": req.event_id,
                "visitor_id": visitor["id"]
            }).execute()
        except Exception as e:
            # We don't want to fail the whole registration if event registration fails,
            # but let's log it or raise if critical. Let's raise for safety.
            print(f"Error registering event attendee: {e}")
            raise HTTPException(status_code=500, detail=f"Visitante registrado, pero error al asociar al evento: {str(e)}")
    
    # Log activity
    log_activity(
        db,
        ActivityCreateRequest(
            service_type="other",
            service_name="visitor_registered",
            activity_date=now.date(),
            visitor_id=visitor["id"],
            description=f"Entrada registrada: {req.reason or 'Visita general'}"
        ),
        registered_by
    )
    
    return visitor


def checkout_visitor(db: Client, visitor_id: str, user_id: str) -> dict:
    """Register checkout for a visitor."""
    now = datetime.now(timezone.utc)
    
    # Check if visitor exists and is not already checked out
    visitor_res = db.table("visitors").select("*").eq("id", visitor_id).execute()
    if not visitor_res.data:
        raise HTTPException(status_code=404, detail="Visitante no encontrado.")
        
    visitor = visitor_res.data[0]
    if visitor.get("check_out"):
        raise HTTPException(status_code=400, detail="El visitante ya tiene registrada su salida.")
        
    # Update check_out
    response = db.table("visitors").update({"check_out": now.isoformat()}).eq("id", visitor_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=500, detail="Error al registrar la salida.")
        
    updated_visitor = response.data[0]
    
    # Log activity
    log_activity(
        db,
        ActivityCreateRequest(
            service_type="other",
            service_name="visitor_checkout",
            activity_date=now.date(),
            visitor_id=visitor_id,
            description="Salida registrada"
        ),
        user_id
    )
    
    return updated_visitor
