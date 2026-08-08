import { api } from '../../../lib/api';
import type { GlobalStatisticsResponse } from '../types';

export const statisticsApi = {
  getGlobalStatistics: (params?: { 
    period?: string; 
    start_date?: string; 
    end_date?: string; 
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.period) searchParams.append('period', params.period);
    if (params?.start_date) searchParams.append('start_date', params.start_date);
    if (params?.end_date) searchParams.append('end_date', params.end_date);
    
    const query = searchParams.toString();
    return api.get<GlobalStatisticsResponse>(`/api/statistics/global${query ? `?${query}` : ''}`);
  },
};
