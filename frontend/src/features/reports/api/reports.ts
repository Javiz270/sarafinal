import { api } from '../../../lib/api';
import type { ReportPreviewResponse, ReportType } from '../types';

export const getReportPreview = async (
  type: ReportType,
  startDate?: string,
  endDate?: string
): Promise<ReportPreviewResponse> => {
  const params = new URLSearchParams();
  params.append('type', type);
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  
  // api.get returns the generic T directly, and API_BASE_URL doesn't include /api
  const data = await api.get<ReportPreviewResponse>(`/api/reports/preview?${params.toString()}`);
  return data;
};

export const exportReportExcel = async (
  type: ReportType,
  startDate?: string,
  endDate?: string
): Promise<void> => {
  const params = new URLSearchParams();
  params.append('type', type);
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  
  // Use the built-in api.download method from lib/api.ts
  await api.download(`/api/reports/export?${params.toString()}`, `reporte_${type}.xlsx`);
};
