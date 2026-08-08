"""
Report service — business logic for generating reports and Excel exports.
"""

from datetime import datetime, time, timezone
import io
import openpyxl
from supabase import Client
from typing import Any


def _parse_dates(start_str: str | None, end_str: str | None) -> tuple[str | None, str | None]:
    start_iso = None
    end_iso = None
    now = datetime.now(timezone.utc)
    try:
        if start_str:
            dt = datetime.fromisoformat(start_str.replace('Z', '+00:00'))
            start_iso = datetime.combine(dt.date(), time.min, timezone.utc).isoformat()
        if end_str:
            dt = datetime.fromisoformat(end_str.replace('Z', '+00:00'))
            end_iso = datetime.combine(dt.date(), time.max, timezone.utc).isoformat()
    except Exception:
        pass
    return start_iso, end_iso


def get_report_data(
    db: Client, 
    report_type: str, 
    start_date: str | None = None, 
    end_date: str | None = None,
    limit: int | None = None
) -> tuple[list[str], list[dict[str, Any]]]:
    """Fetch structured data for reports based on type and filters."""
    start_iso, end_iso = _parse_dates(start_date, end_date)
    
    columns: list[str] = []
    rows: list[dict[str, Any]] = []

    if report_type == "loans":
        query = db.table("loans").select(
            "id, status, loan_date, due_date, return_date, profiles(full_name, email), resources(title, author)"
        )
        if start_iso: query = query.gte("loan_date", start_iso)
        if end_iso: query = query.lte("loan_date", end_iso)
        
        data = query.execute().data or []
        columns = ["ID", "Status", "Fecha Préstamo", "Fecha Límite", "Fecha Devolución", "Usuario", "Email Usuario", "Libro", "Autor"]
        for d in data:
            prof = d.get("profiles") or {}
            res = d.get("resources") or {}
            rows.append({
                "ID": d.get("id"),
                "Status": d.get("status"),
                "Fecha Préstamo": d.get("loan_date"),
                "Fecha Límite": d.get("due_date"),
                "Fecha Devolución": d.get("return_date"),
                "Usuario": prof.get("full_name", ""),
                "Email Usuario": prof.get("email", ""),
                "Libro": res.get("title", ""),
                "Autor": res.get("author", "")
            })

    elif report_type == "cubicles":
        query = db.table("cubicle_reservations").select(
            "id, status, start_time, end_time, profiles(full_name, email), cubicles(name, code)"
        )
        if start_iso: query = query.gte("start_time", start_iso)
        if end_iso: query = query.lte("start_time", end_iso)
        
        data = query.execute().data or []
        columns = ["ID", "Status", "Inicio", "Fin", "Usuario", "Email", "Cubículo", "Código"]
        for d in data:
            prof = d.get("profiles") or {}
            cub = d.get("cubicles") or {}
            rows.append({
                "ID": d.get("id"),
                "Status": d.get("status"),
                "Inicio": d.get("start_time"),
                "Fin": d.get("end_time"),
                "Usuario": prof.get("full_name", ""),
                "Email": prof.get("email", ""),
                "Cubículo": cub.get("name", ""),
                "Código": cub.get("code", "")
            })

    elif report_type == "visitors":
        query = db.table("visitors").select(
            "id, full_name, email, institution, reason, check_in, check_out, registered_by"
        )
        if start_iso: query = query.gte("check_in", start_iso)
        if end_iso: query = query.lte("check_in", end_iso)
        
        data = query.execute().data or []
        columns = ["ID", "Nombre", "Email", "Institución", "Motivo", "Ingreso", "Salida"]
        for d in data:
            rows.append({
                "ID": d.get("id"),
                "Nombre": d.get("full_name"),
                "Email": d.get("email", ""),
                "Institución": d.get("institution", ""),
                "Motivo": d.get("reason", ""),
                "Ingreso": d.get("check_in"),
                "Salida": d.get("check_out", "No ha salido")
            })

    elif report_type == "events":
        query = db.table("event_attendees").select(
            "id, registered_at, events(name, start_time), profiles(full_name, email), visitors(full_name, institution)"
        )
        if start_iso: query = query.gte("registered_at", start_iso)
        if end_iso: query = query.lte("registered_at", end_iso)
        
        data = query.execute().data or []
        columns = ["ID Asistencia", "Evento", "Fecha Evento", "Tipo Asistente", "Nombre", "Email/Institución", "Registrado el"]
        for d in data:
            ev = d.get("events") or {}
            prof = d.get("profiles")
            vis = d.get("visitors")
            
            tipo = "Alumno/Docente" if prof else "Visitante"
            nombre = prof.get("full_name") if prof else (vis.get("full_name") if vis else "")
            detalle = prof.get("email") if prof else (vis.get("institution") if vis else "Externo")

            rows.append({
                "ID Asistencia": d.get("id"),
                "Evento": ev.get("name", ""),
                "Fecha Evento": ev.get("start_time", ""),
                "Tipo Asistente": tipo,
                "Nombre": nombre,
                "Email/Institución": detalle,
                "Registrado el": d.get("registered_at")
            })

    elif report_type == "activities":
        query = db.table("activities").select(
            "id, service_type, service_name, description, activity_date, profiles(full_name, email)"
        )
        if start_iso: query = query.gte("activity_date", start_iso)
        if end_iso: query = query.lte("activity_date", end_iso)
        
        data = query.execute().data or []
        columns = ["ID", "Servicio", "Acción", "Descripción", "Fecha", "Usuario", "Email"]
        for d in data:
            prof = d.get("profiles") or {}
            rows.append({
                "ID": d.get("id"),
                "Servicio": d.get("service_type"),
                "Acción": d.get("service_name"),
                "Descripción": d.get("description"),
                "Fecha": d.get("activity_date"),
                "Usuario": prof.get("full_name", ""),
                "Email": prof.get("email", "")
            })

    else:
        # Unknown type
        columns = ["Mensaje"]
        rows = [{"Mensaje": "Tipo de reporte no soportado."}]

    if limit and len(rows) > limit:
        rows = rows[:limit]

    return columns, rows


def export_report_excel(db: Client, report_type: str, start_date: str | None = None, end_date: str | None = None) -> io.BytesIO:
    """Generate an Excel workbook buffer for the specified report."""
    columns, rows = get_report_data(db, report_type, start_date, end_date)
    
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = f"Reporte {report_type.capitalize()}"
    
    # Headers
    ws.append(columns)
    
    # Rows
    for row in rows:
        ws.append([row.get(col, "") for col in columns])
        
    # Auto-adjust column widths
    for col in ws.columns:
        max_length = 0
        column = col[0].column_letter
        for cell in col:
            try:
                if len(str(cell.value)) > max_length:
                    max_length = len(cell.value)
            except:
                pass
        adjusted_width = (max_length + 2)
        ws.column_dimensions[column].width = adjusted_width

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer
