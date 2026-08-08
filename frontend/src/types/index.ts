/* ============================================================
   S.A.R.A. — Global TypeScript Types
   ============================================================ */

// ── Roles ─────────────────────────────────────────────────
export type Role = 'user' | 'staff' | 'admin';

// ── User ──────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  career: string | null;
  group: string | null;
  role: Role;
  created_at: string | null;
}

// ── Cubicle ───────────────────────────────────────────────
export type CubicleStatus = 'available' | 'occupied' | 'maintenance';

export interface Cubicle {
  id: string;
  name: string;
  status: CubicleStatus;
  assigned_to: string | null;
  assigned_user_name: string | null;
  assigned_at: string | null;
}

// ── Book (Resource) ───────────────────────────────────────
export interface Book {
  id: string;
  title: string;
  author: string | null;
  isbn: string | null;
  publisher: string | null;
  published_year: number | null;
  description: string | null;
  cover_url: string | null;
  google_books_id: string | null;
  copies_total: number;
  copies_available: number;
}

// ── Book Copy (Ejemplar) ─────────────────────────────────
export type BookCopyStatus = 'available' | 'loaned' | 'maintenance' | 'lost';

export interface BookCopy {
  id: string;
  barcode: string;
  resource_id: string;
  book_title: string | null;
  book_author: string | null;
  cover_url: string | null;
  status: BookCopyStatus;
}

// ── Loan ──────────────────────────────────────────────────
export type LoanStatus = 'active' | 'returned' | 'overdue';

export interface Loan {
  id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  copy_id: string;
  copy_barcode: string | null;
  book_title: string | null;
  book_author: string | null;
  cover_url: string | null;
  loan_date: string;
  due_date: string;
  return_date: string | null;
  status: LoanStatus;
}

// ── Visitor ───────────────────────────────────────────────
export interface Visitor {
  id: string;
  name: string;
  institution: string | null;
  reason: string | null;
  visit_date: string;
  check_in: string | null;
  check_out: string | null;
  event_id: string | null;
  event_name: string | null;
}

// ── Event ─────────────────────────────────────────────────
export type EventType =
  | 'conference'
  | 'fair'
  | 'workshop'
  | 'presentation'
  | 'special'
  | 'other';

export interface AppEvent {
  id: string;
  name: string;
  event_type: EventType;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  attendee_count: number;
}

// ── Activity ──────────────────────────────────────────────
export type ServiceType =
  | 'cubicle'
  | 'loan'
  | 'computer'
  | 'language'
  | 'event'
  | 'other';

export interface Activity {
  id: string;
  user_id: string;
  user_name: string | null;
  service_type: ServiceType;
  description: string | null;
  activity_date: string;
  related_id: string | null;
}

// ── API Response ──────────────────────────────────────────
export interface ApiError {
  detail: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
