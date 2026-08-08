import { api } from '../../../lib/api';
import type { Visitor, CreateVisitorRequest } from '../types';

export const visitorsApi = {
  getVisitors: (params?: { 
    date_filter?: string; 
    search?: string; 
    reason?: string; 
    inside_only?: boolean 
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.date_filter) searchParams.append('date_filter', params.date_filter);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.reason) searchParams.append('reason', params.reason);
    if (params?.inside_only) searchParams.append('inside_only', 'true');
    
    const query = searchParams.toString();
    return api.get<Visitor[]>(`/api/visitors/${query ? `?${query}` : ''}`);
  },

  createVisitor: (data: CreateVisitorRequest) => 
    api.post<Visitor>('/api/visitors/', data),

  checkoutVisitor: (id: string) => 
    api.post<Visitor>(`/api/visitors/${id}/checkout`),
};
