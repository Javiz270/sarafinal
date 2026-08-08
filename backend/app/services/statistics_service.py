"""
Statistics service — business logic for S.A.R.A. statistics.
"""

from datetime import datetime, time, timedelta, timezone
from supabase import Client


def get_global_statistics(
    db: Client,
    period: str = "month",
    start_str: str | None = None,
    end_str: str | None = None,
) -> dict:
    """Calculate and return operational statistics for staff/admin."""
    now = datetime.now(timezone.utc)
    
    # Calculate date range
    if period == "today":
        start_date = datetime.combine(now.date(), time.min, timezone.utc)
        end_date = datetime.combine(now.date(), time.max, timezone.utc)
    elif period == "week":
        start_date = datetime.combine(now.date() - timedelta(days=now.weekday()), time.min, timezone.utc)
        end_date = now
    elif period == "month":
        start_date = datetime.combine(now.date().replace(day=1), time.min, timezone.utc)
        end_date = now
    elif period == "year":
        start_date = datetime.combine(now.date().replace(month=1, day=1), time.min, timezone.utc)
        end_date = now
    elif period == "custom" and start_str and end_str:
        try:
            start_date = datetime.fromisoformat(start_str.replace('Z', '+00:00'))
            end_date = datetime.fromisoformat(end_str.replace('Z', '+00:00'))
        except Exception:
            start_date = datetime.combine(now.date().replace(day=1), time.min, timezone.utc)
            end_date = now
    else:
        # Default to month
        period = "month"
        start_date = datetime.combine(now.date().replace(day=1), time.min, timezone.utc)
        end_date = now

    start_iso = start_date.isoformat()
    end_iso = end_date.isoformat()

    # 1. Cubicles Stats
    # Fetch all cubicles
    c_res = db.table("cubicles").select("id, name, code").execute()
    cubicles = c_res.data or []
    # Fetch reservations in period
    reservations = db.table("cubicle_reservations").select("cubicle_id").gte("start_time", start_iso).lte("start_time", end_iso).execute().data or []
    
    cubicle_stats = []
    for c in cubicles:
        uses = sum(1 for r in reservations if r["cubicle_id"] == c["id"])
        cubicle_stats.append({
            "name": c["name"],
            "code": c["code"],
            "uses": uses
        })

    # 2. Loans Stats
    loans_res = db.table("loans").select("id, status, loan_date, due_date, return_date, resource_id, resources(title, author)").execute().data or []
    
    total_loans = 0
    active_loans = 0
    returned_loans = 0
    overdue_loans = 0
    book_counts = {}

    for l in loans_res:
        l_date = datetime.fromisoformat(l["loan_date"].replace('Z', '+00:00'))
        
        # Check if loan belongs to period
        if start_date <= l_date <= end_date:
            total_loans += 1
            if l["status"] == "returned":
                returned_loans += 1
            elif l["status"] == "active":
                # Check if it has expired since
                due = datetime.fromisoformat(l["due_date"].replace('Z', '+00:00'))
                if now > due:
                    overdue_loans += 1
                else:
                    active_loans += 1
            elif l["status"] == "overdue":
                overdue_loans += 1
                
            # Process popular books count
            res_id = l["resource_id"]
            res_info = l.get("resources")
            if res_info:
                title = res_info.get("title")
                author = res_info.get("author")
                if res_id not in book_counts:
                    book_counts[res_id] = {"title": title, "author": author, "count": 0}
                book_counts[res_id]["count"] += 1

    popular_books = sorted(book_counts.values(), key=lambda x: x["count"], reverse=True)[:5]
    popular_books_res = [
        {"title": b["title"], "author": b["author"], "loans_count": b["count"]}
        for b in popular_books
    ]

    # 3. Visitors Stats
    visitors_res = db.table("visitors").select("id, check_in, check_out, reason").execute().data or []
    
    today_start = datetime.combine(now.date(), time.min, timezone.utc)
    today_end = datetime.combine(now.date(), time.max, timezone.utc)
    
    visitors_today = 0
    visitors_period = 0
    visitors_inside = 0
    reasons_counts = {}

    for v in visitors_res:
        v_in = datetime.fromisoformat(v["check_in"].replace('Z', '+00:00'))
        
        # Today count
        if today_start <= v_in <= today_end:
            visitors_today += 1
            
        # Currently inside
        if not v.get("check_out"):
            visitors_inside += 1
            
        # In period count & reasons
        if start_date <= v_in <= end_date:
            visitors_period += 1
            reason = v.get("reason") or "Visita general"
            reasons_counts[reason] = reasons_counts.get(reason, 0) + 1

    # 4. Events Stats
    events_res = db.table("events").select("id, name, start_time").gte("start_time", start_iso).lte("start_time", end_iso).execute().data or []
    
    completed_events = 0
    upcoming_events = 0
    total_attendees = 0
    popular_events = []

    if events_res:
        event_ids = [e["id"] for e in events_res]
        attendees_res = db.table("event_attendees").select("event_id").in_("event_id", event_ids).execute().data or []
        
        for e in events_res:
            e_start = datetime.fromisoformat(e["start_time"].replace('Z', '+00:00'))
            if e_start < now:
                completed_events += 1
            else:
                upcoming_events += 1
                
            e_att_count = sum(1 for a in attendees_res if a["event_id"] == e["id"])
            popular_events.append({
                "id": e["id"],
                "name": e["name"],
                "attendees_count": e_att_count
            })
            
        total_attendees = len(attendees_res)
        popular_events = sorted(popular_events, key=lambda x: x["attendees_count"], reverse=True)[:5]

    return {
        "period": period,
        "start_date": start_date,
        "end_date": end_date,
        "cubicles": cubicle_stats,
        "loans": {
            "total": total_loans,
            "active": active_loans,
            "returned": returned_loans,
            "overdue": overdue_loans,
            "popular_books": popular_books_res
        },
        "visitors": {
            "today": visitors_today,
            "period_total": visitors_period,
            "currently_inside": visitors_inside,
            "reasons": reasons_counts
        },
        "events": {
            "completed": completed_events,
            "upcoming": upcoming_events,
            "total_attendees": total_attendees,
            "popular_events": popular_events
        }
    }
