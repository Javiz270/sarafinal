"""
Events API router.
"""

from fastapi import APIRouter, Depends

from app.core.dependencies import DBDep, UserDep, require_staff
from app.schemas.event import (
    EventCreateRequest,
    EventResponse,
    EventAttendeeRequest,
    EventAttendeeResponse,
)
from app.services.event_service import (
    list_events,
    get_event,
    list_event_attendees,
    create_event,
    register_event_attendee,
)

router = APIRouter()


@router.get(
    "/",
    response_model=list[EventResponse],
    summary="Listar eventos",
    description="Obtiene todos los eventos registrados. Cualquier usuario autenticado puede consultarlos.",
)
async def get_events(db: DBDep, user: UserDep):
    """List all events."""
    return list_events(db)


@router.get(
    "/{event_id}",
    response_model=EventResponse,
    summary="Obtener detalles de un evento",
    description="Obtiene los detalles de un evento específico por su ID.",
)
async def get_event_by_id(event_id: str, db: DBDep, user: UserDep):
    """Get single event details."""
    return get_event(db, event_id)


@router.get(
    "/{event_id}/attendees",
    response_model=list[EventAttendeeResponse],
    dependencies=[Depends(require_staff)],
    summary="Listar asistentes de un evento",
    description="Obtiene la lista de asistentes a un evento. Solo accesible para Staff/Admin.",
)
async def get_event_attendees(event_id: str, db: DBDep):
    """List attendees for an event."""
    return list_event_attendees(db, event_id)


@router.post(
    "/",
    response_model=EventResponse,
    dependencies=[Depends(require_staff)],
    summary="Crear un evento",
    description="Crea un nuevo evento. Solo accesible para Staff/Admin.",
)
async def create_new_event(body: EventCreateRequest, db: DBDep, user: UserDep):
    """Create an event."""
    return create_event(db, body, created_by=user.id)


@router.post(
    "/{event_id}/attendees",
    response_model=EventAttendeeResponse,
    dependencies=[Depends(require_staff)],
    summary="Registrar asistencia",
    description="Registra la asistencia de un alumno (user_id) o visitante externo (visitor_id) a un evento.",
)
async def register_attendee(
    event_id: str,
    body: EventAttendeeRequest,
    db: DBDep,
    user: UserDep,
):
    """Register an attendee to an event."""
    return register_event_attendee(db, event_id, body, registered_by=user.id)
