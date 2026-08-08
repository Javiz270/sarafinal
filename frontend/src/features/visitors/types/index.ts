export interface Visitor {
  id: string;
  full_name: string;
  email: string | null;
  institution: string | null;
  reason: string | null;
  check_in: string;
  check_out: string | null;
  registered_by: string;
  event_id: string | null;
  created_at: string;
  registered_by_name: string | null;
}

export interface CreateVisitorRequest {
  full_name: string;
  reason: string | null;
  email?: string | null;
  institution?: string | null;
  event_id?: string | null;
}
