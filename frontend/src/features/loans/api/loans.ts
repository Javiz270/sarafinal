import { api } from '../../../lib/api';
import type { 
  LoanWithDetails, 
  BarcodeLookup, 
  CreateLoanRequest, 
  ReturnLoanRequest 
} from '../../../types/loan';

export const loanApi = {
  // Staff endpoints
  getByBarcode: (barcode: string) => 
    api.get<BarcodeLookup>(`/api/loans/by-barcode/${barcode}`),
    
  createLoan: (data: CreateLoanRequest) => 
    api.post<{id: string, message: string}>('/api/loans/', data),
    
  returnLoan: (loanId: string, data: ReturnLoanRequest) => 
    api.post<{message: string}>(`/api/loans/${loanId}/return`, data),
    
  getLoans: (status?: string) => 
    api.get<LoanWithDetails[]>(`/api/loans/${status ? `?status=${status}` : ''}`),
    
  // User endpoints
  getMyLoans: (status?: string) => 
    api.get<LoanWithDetails[]>(`/api/loans/my${status ? `?status=${status}` : ''}`),
    
  // General endpoints
  getLoan: (id: string) => 
    api.get<LoanWithDetails>(`/api/loans/${id}`),
};
