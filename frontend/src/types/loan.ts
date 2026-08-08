// ── Loan Types ──────────────────────────────────────────────────

export type LoanStatus = 'active' | 'returned' | 'overdue';

export interface Loan {
  id: string;
  resource_id: string;
  book_copy_id: string | null;
  user_id: string;
  registered_by: string;
  loan_date: string;
  due_date: string;
  return_date: string | null;
  status: LoanStatus;
  notes: string | null;
}

export interface LoanWithUser extends Loan {
  user_name: string | null;
  user_email: string | null;
  user_career: string | null;
  user_group: string | null;
}

export interface LoanWithBook extends Loan {
  resource_title: string | null;
  resource_author: string | null;
  cover_url: string | null;
  copy_barcode: string | null;
}

export type LoanWithDetails = LoanWithUser & LoanWithBook;

export interface CreateLoanRequest {
  user_id: string;
  barcode: string;
  due_date: string;
  notes?: string | null;
}

export interface ReturnLoanRequest {
  notes?: string | null;
}

export interface BarcodeLookup {
  copy_id: string;
  barcode: string;
  status: string;
  resource_id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  isbn: string | null;
}
