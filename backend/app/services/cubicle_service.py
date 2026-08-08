"""
Cubicle service — business logic for managing cubicles and reservations.
"""

from datetime import datetime, timezone
from typing import Any, List

from fastapi import HTTPException, status
from supabase import Client


def list_cubicles(db: Client) -> List[dict[str, Any]]:
    """List all cubicles, including their active reservation and user info if occupied."""
    # Fetch all cubicles
    result = db.table("cubicles").select("*").order("name").execute()
    cubicles = result.data or []

    # Fetch active reservations with user profiles
    active_res = (
        db.table("cubicle_reservations")
        .select("*, profiles:user_id(id, full_name, email)")
        .eq("status", "active")
        .execute()
    )
    reservations_by_cubicle = {
        res["cubicle_id"]: res for res in (active_res.data or [])
    }

    # Merge data
    for cubicle in cubicles:
        cubicle["active_reservation"] = None
        cubicle["active_user"] = None
        
        if cubicle["id"] in reservations_by_cubicle:
            res = reservations_by_cubicle[cubicle["id"]]
            user_data = res.pop("profiles", None)
            
            cubicle["active_reservation"] = res
            cubicle["active_user"] = user_data

    return cubicles


def get_user_history(db: Client, user_id: str) -> List[dict[str, Any]]:
    """Get history of cubicle usage for a specific user."""
    result = (
        db.table("cubicle_reservations")
        .select("*, cubicles(name)")
        .eq("user_id", user_id)
        .order("start_time", desc=True)
        .execute()
    )
    
    history = []
    for row in (result.data or []):
        history.append({
            "id": row["id"],
            "cubicle_name": row.get("cubicles", {}).get("name", "Desconocido"),
            "start_time": row["start_time"],
            "end_time": row.get("end_time"),
            "status": row["status"],
            "notes": row.get("notes")
        })
        
    return history


def occupy_cubicle(db: Client, cubicle_id: str, user_id: str, registered_by: str, notes: str | None = None) -> dict[str, Any]:
    """Assign a cubicle to a user."""
    # 1. Verify cubicle exists and is available
    cubicle_res = db.table("cubicles").select("*").eq("id", cubicle_id).execute()
    if not cubicle_res.data:
        raise HTTPException(status_code=404, detail="El cubículo no existe.")
    cubicle = cubicle_res.data[0]
    
    if cubicle["status"] == "maintenance":
        raise HTTPException(status_code=400, detail="El cubículo se encuentra en mantenimiento.")
    
    if cubicle["status"] == "occupied":
        raise HTTPException(status_code=400, detail="El cubículo ya está ocupado.")

    # 2. Verify user exists
    user_res = db.table("profiles").select("id").eq("id", user_id).execute()
    if not user_res.data:
        raise HTTPException(status_code=404, detail="El usuario indicado no existe.")

    # 3. Create reservation
    res_data = {
        "cubicle_id": cubicle_id,
        "user_id": user_id,
        "registered_by": registered_by,
        "status": "active",
        "notes": notes
    }
    insert_res = db.table("cubicle_reservations").insert(res_data).execute()
    
    if not insert_res.data:
        raise HTTPException(status_code=500, detail="Error al registrar la reserva.")

    # 4. Update cubicle status
    db.table("cubicles").update({"status": "occupied"}).eq("id", cubicle_id).execute()
    
    return insert_res.data[0]


def release_cubicle(db: Client, cubicle_id: str, registered_by: str) -> dict[str, Any]:
    """Release a cubicle and record activity."""
    # Find active reservation
    res_query = (
        db.table("cubicle_reservations")
        .select("*")
        .eq("cubicle_id", cubicle_id)
        .eq("status", "active")
        .execute()
    )
    
    if not res_query.data:
        raise HTTPException(status_code=400, detail="El cubículo no tiene un uso activo actualmente.")
        
    reservation = res_query.data[0]
    now_iso = datetime.now(timezone.utc).isoformat()
    
    # 1. Close reservation
    update_res = (
        db.table("cubicle_reservations")
        .update({
            "status": "completed",
            "end_time": now_iso
        })
        .eq("id", reservation["id"])
        .execute()
    )
    
    # 2. Update cubicle to available
    db.table("cubicles").update({"status": "available"}).eq("id", cubicle_id).execute()
    
    # 3. Register activity
    try:
        cubicle_data = db.table("cubicles").select("name").eq("id", cubicle_id).execute()
        c_name = cubicle_data.data[0]["name"] if cubicle_data.data else "Cubículo"
        
        db.table("activities").insert({
            "user_id": reservation["user_id"],
            "registered_by": registered_by,
            "cubicle_id": cubicle_id,
            "service_type": "cubicle",
            "service_name": f"Uso de {c_name}",
            "description": f"Cubículo {c_name} utilizado.",
        }).execute()
    except Exception as e:
        # We don't fail the release if activity logging fails, but we should log it
        print(f"Warning: Failed to insert activity for cubicle release: {e}")
        
    return update_res.data[0]


def set_maintenance_status(db: Client, cubicle_id: str, to_maintenance: bool) -> dict[str, Any]:
    """Toggle a cubicle's maintenance status."""
    cubicle_res = db.table("cubicles").select("*").eq("id", cubicle_id).execute()
    if not cubicle_res.data:
        raise HTTPException(status_code=404, detail="El cubículo no existe.")
    cubicle = cubicle_res.data[0]
    
    if to_maintenance:
        if cubicle["status"] == "occupied":
            raise HTTPException(status_code=400, detail="No se puede poner en mantenimiento un cubículo ocupado.")
        new_status = "maintenance"
    else:
        new_status = "available"
        
    update_res = db.table("cubicles").update({"status": new_status}).eq("id", cubicle_id).execute()
    return update_res.data[0]
