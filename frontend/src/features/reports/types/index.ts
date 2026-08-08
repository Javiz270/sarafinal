export type ReportType = 'loans' | 'cubicles' | 'visitors' | 'events' | 'activities';

export interface ReportPreviewResponse {
  columns: string[];
  rows: Record<string, any>[];
}
