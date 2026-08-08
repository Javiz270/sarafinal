export interface Event {
  id: string;
  name: string;
  description: string | null;
  event_type: string | null;
  location: string | null;
  start_time: string;
  end_time: string | null;
  created_by: string;
  created_at: string;
  attendee_count: number;
}

export interface CreateEventRequest {
  name: string;
  description: string | null;
  event_type: string | null;
  location: string | null;
  start_time: string; // ISO string
  end_time: string | null; // ISO string
}

export interface EventAttendee {
  id: string;
  event_id: string;
  user_id: string | null;
  visitor_id: string | null;
  registered_at: string;
  user_name: string | null;
  visitor_name: string | null;
  visitor_institution: string | null;
}

export interface EventAttendeeRequest {
  user_id?: string | null;
  visitor_id?: string | null;
}
