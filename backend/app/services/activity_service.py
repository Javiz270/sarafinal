"""
Activity service — business logic for service/activity tracking.

Responsibilities:
- Register service usage (cubicle, loan, computer, language, event, other)
- Query activities by user
- Calculate activity statistics
"""

from app.schemas.activity import ActivityCreateRequest
from supabase import Client

def log_activity(db: Client, req: ActivityCreateRequest, registered_by: str):
    """Log an activity to the database."""
    activity_data = {
        "service_type": req.service_type,
        "description": req.description,
        "activity_date": req.activity_date.isoformat(),
        "registered_by": registered_by,
    }
    
    if req.user_id:
        activity_data["user_id"] = req.user_id
    if req.visitor_id:
        activity_data["visitor_id"] = req.visitor_id
    if req.service_name:
        activity_data["service_name"] = req.service_name
    
    if req.service_type == "loan":
        activity_data["loan_id"] = req.related_id
    elif req.service_type == "cubicle":
        activity_data["cubicle_id"] = req.related_id
    elif req.service_type == "event":
        activity_data["event_id"] = req.related_id
        
    db.table("activities").insert(activity_data).execute()
