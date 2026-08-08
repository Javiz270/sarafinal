"""
Visitors endpoints.

- GET    /api/visitors          — List visitors
- POST   /api/visitors          — Register a new visitor
- POST   /api/visitors/{id}/checkout — Register checkout
"""

from fastapi import APIRouter, Depends, Query

from app.core.dependencies import DBDep, UserDep, require_staff
from app.schemas.visitor import VisitorCreateRequest, VisitorResponse
from app.services.visitor_service import (
    create_visitor,
    list_visitors,
    checkout_visitor,
)

router = APIRouter(
    dependencies=[Depends(require_staff)],
    responses={
        401: {"description": "No autorizado"},
        403: {"description": "Permisos insuficientes (requiere staff/admin)"},
    },
)


@router.get(
    "/",
    response_model=list[VisitorResponse],
    summary="Listar visitantes",
    description="Obtiene el registro de visitantes. Permite filtrar por estado, fecha y motivo.",
)
async def get_visitors(
    db: DBDep,
    date_filter: str | None = Query(None, description="Filtrar por fecha YYYY-MM-DD"),
    search: str | None = Query(None, description="Buscar por nombre"),
    reason: str | None = Query(None, description="Filtrar por motivo"),
    inside_only: bool = Query(False, description="Mostrar solo visitantes que no han registrado salida"),
):
    """List all visitors (staff/admin only)."""
    return list_visitors(
        db,
        date_filter=date_filter,
        search=search,
        reason=reason,
        inside_only=inside_only,
    )


@router.post(
    "/",
    response_model=VisitorResponse,
    summary="Registrar entrada",
    description="Registra la entrada de un visitante externo.",
)
async def register_visitor(
    body: VisitorCreateRequest,
    db: DBDep,
    user: UserDep,
):
    """Register a new visitor."""
    return create_visitor(db, body, registered_by=user.id)


@router.post(
    "/{visitor_id}/checkout",
    response_model=VisitorResponse,
    summary="Registrar salida",
    description="Registra la salida de un visitante externo que actualmente se encuentra dentro.",
)
async def register_checkout(
    visitor_id: str,
    db: DBDep,
    user: UserDep,
):
    """Register checkout for a visitor."""
    return checkout_visitor(db, visitor_id, user_id=user.id)
