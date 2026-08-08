"""
Users endpoints.

- GET    /api/users          — List users (admin)
- GET    /api/users/{id}     — Get user profile
- PATCH  /api/users/{id}     — Update user profile
- PATCH  /api/users/{id}/role — Update user role (admin only)
- GET    /api/users/{id}/stats — Get user statistics
"""

from fastapi import APIRouter, Depends, Query

from app.core.dependencies import DBDep, UserDep, require_admin
from app.schemas.user import UserProfile, UserRoleUpdate, UserStats, UserUpdate
from app.services.auth_service import update_user_role
from app.services.user_service import (
    get_user_profile,
    get_user_stats,
    list_users as list_users_service,
    update_user_profile,
)

router = APIRouter()


@router.get(
    "/",
    response_model=list[UserProfile],
    summary="Listar usuarios",
    description="Lista todos los usuarios. Solo accesible para administradores.",
    dependencies=[Depends(require_admin)],
)
async def list_users(
    db: DBDep,
    search: str | None = Query(None, description="Buscar por nombre o email"),
    role: str | None = Query(None, description="Filtrar por rol"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """List all users (admin only)."""
    return list_users_service(db, search=search, role=role, limit=limit, offset=offset)


@router.get(
    "/{user_id}",
    response_model=UserProfile,
    summary="Obtener perfil de usuario",
    description="Obtiene el perfil de un usuario específico.",
)
async def get_user(user_id: str, db: DBDep, user: UserDep):
    """Get a specific user's profile."""
    return get_user_profile(db, user_id)


@router.patch(
    "/{user_id}",
    response_model=UserProfile,
    summary="Actualizar perfil",
    description="Actualiza el perfil de un usuario. Los usuarios solo pueden "
    "actualizar su propio perfil. El campo 'role' es ignorado.",
)
async def update_user(user_id: str, body: UserUpdate, db: DBDep, user: UserDep):
    """
    Update a user's profile.

    Users can only update their own profile.
    Admins can update any profile.
    Role field is always stripped — use the dedicated role endpoint.
    """
    if user.id != user_id and user.role != "admin":
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puedes editar el perfil de otro usuario.",
        )

    return update_user_profile(
        db,
        user_id,
        body.model_dump(exclude_unset=True),
    )


@router.patch(
    "/{user_id}/role",
    response_model=UserProfile,
    summary="Cambiar rol de usuario",
    description="Cambia el rol de un usuario. Solo accesible para administradores. "
    "Los usuarios NO pueden cambiar su propio rol ni auto-asignarse staff/admin.",
    dependencies=[Depends(require_admin)],
)
async def change_user_role(
    user_id: str,
    body: UserRoleUpdate,
    db: DBDep,
    user: UserDep,
):
    """Change a user's role (admin only)."""
    return update_user_role(
        db=db,
        target_user_id=user_id,
        new_role=body.role,
        admin_user_id=user.id,
    )


@router.get(
    "/{user_id}/stats",
    response_model=UserStats,
    summary="Estadísticas de usuario",
    description="Obtiene las estadísticas de un usuario específico.",
)
async def get_stats(user_id: str, db: DBDep, user: UserDep):
    """Get a user's statistics."""
    if user.id != user_id and user.role not in ("staff", "admin"):
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver las estadísticas de otro usuario.",
        )
    return get_user_stats(db, user_id)
