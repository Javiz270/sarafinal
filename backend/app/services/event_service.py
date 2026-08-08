"""
Event service — business logic for events.
"""

from datetime import datetime, timezone
from fastapi import HTTPException
from supabase import Client

from app.schemas.event import EventCreateRequest, EventAttendeeRequest
from app.schemas.activity import ActivityCreateRequest
from app.services.activity_service import log_activity


def list_events(db: Client) -> list[dict]:
    """List all events with their attendee count."""
    # attendee_count:event_attendees(count) returns count of rows in event_attendees for each event
    response = db.table("events").select("*, attendee_count:event_attendees(count)").order("start_time", desc=True).execute()
    
    events = []
    for row in (response.data or []):
        # PostgREST count query returns structure like [{'count': N}]
        counts = row.get("attendee_count")
        count_val = 0
        if isinstance(counts, list) and len(counts) > 0:
            count_val = counts[0].get("count", 0)
        elif isinstance(counts, dict):
            count_val = counts.get("count", 0)
            
        row["attendee_count"] = count_val
        events.append(row)
        
    return events


def get_event(db: Client, event_id: str) -> dict:
    """Get details of a single event."""
    response = db.table("events").select("*").eq("id", event_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Evento no encontrado.")
        
    event = response.data[0]
    
    # Fetch attendees count
    count_res = db.table("event_attendees").select("id", count="exact").eq("event_id", event_id).execute()
    event["attendee_count"] = count_res.count or 0
    
    return event


def list_event_attendees(db: Client, event_id: str) -> list[dict]:
    """List attendees of an event, resolving profiles or visitors details."""
    response = db.table("event_attendees").select(
        "id, event_id, user_id, visitor_id, registered_at, profiles:user_id(full_name, email), visitors:visitor_id(full_name, email, institution)"
    ).eq("event_id", event_id).execute()
    
    attendees = []
    for row in (response.data or []):
        formatted = {
            "id": row["id"],
            "event_id": row["event_id"],
            "user_id": row["user_id"],
            "visitor_id": row["visitor_id"],
            "registered_at": row["registered_at"],
            "user_name": None,
            "visitor_name": None,
            "visitor_institution": None
        }
        
        # Resolve names and emails
        if row.get("profiles"):
            formatted["user_name"] = row["profiles"].get("full_name")
        if row.get("visitors"):
            formatted["visitor_name"] = row["visitors"].get("full_name")
            formatted["visitor_institution"] = row["visitors"].get("institution")
            
        attendees.append(formatted)
        
    return attendees


def create_event(db: Client, req: EventCreateRequest, created_by: str) -> dict:
    """Create a new event."""
    # Validation: end_time must be greater than start_time if provided
    if req.end_time and req.end_time <= req.start_time:
        raise HTTPException(status_code=400, detail="La fecha de fin debe ser posterior a la fecha de inicio.")
        
    data = {
        "name": req.name,
        "description": req.description,
        "event_type": req.event_type,
        "location": req.location,
        "start_time": req.start_time.isoformat(),
        "end_time": req.end_time.isoformat() if req.end_time else None,
        "created_by": created_by
    }
    
    response = db.table("events").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=500, detail="Error al crear el evento.")
        
    event = response.data[0]
    event["attendee_count"] = 0
    
    # Log activity
    try:
        log_activity(
            db,
            ActivityCreateRequest(
                service_type="event",
                related_id=event["id"],
                description=f"Evento creado: {req.name}",
                activity_date=req.start_time.date()
            ),
            created_by
        )
    except Exception as e:
        print(f"Error logging activity for event creation: {e}")
        
    return event


def register_event_attendee(db: Client, event_id: str, req: EventAttendeeRequest, registered_by: str) -> dict:
    """Register an attendee to an event."""
    if not req.user_id and not req.visitor_id:
        raise HTTPException(status_code=400, detail="Debe proporcionar un user_id o un visitor_id.")
    if req.user_id and req.visitor_id:
        raise HTTPException(status_code=400, detail="No puede proporcionar ambos, user_id y visitor_id.")
        
    # Check if event exists
    event_res = db.table("events").select("id, name, start_time").eq("id", event_id).execute()
    if not event_res.data:
        raise HTTPException(status_code=404, detail="Evento no encontrado.")
    event = event_res.data[0]
    
    # Check if already registered
    check_query = db.table("event_attendees").select("id").eq("event_id", event_id)
    if req.user_id:
        check_query = check_query.eq("user_id", req.user_id)
    else:
        check_query = check_query.eq("visitor_id", req.visitor_id)
        
    check_res = check_query.execute()
    if check_res.data:
        raise HTTPException(status_code=400, detail="Este asistente ya está registrado en este evento.")
        
    # Insert attendee
    data = {
        "event_id": event_id,
        "user_id": req.user_id,
        "visitor_id": req.visitor_id
    }
    
    response = db.table("event_attendees").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=500, detail="Error al registrar la asistencia.")
        
    attendee = response.data[0]
    
    # Log activity
    try:
        activity_date = datetime.fromisoformat(event["start_time"].replace('Z', '+00:00')).date()
    except Exception:
        activity_date = datetime.now(timezone.utc).date()
        
    try:
        log_activity(
            db,
            ActivityCreateRequest(
                service_type="event",
                related_id=event_id,
                user_id=req.user_id,
                visitor_id=req.visitor_id,
                description=f"Asistencia registrada al evento: {event['name']}",
                activity_date=activity_date
            ),
            registered_by
        )
    except Exception as e:
        print(f"Error logging activity for attendee registration: {e}")
        
    return attendee
