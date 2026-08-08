export interface CubicleStats {
  name: string;
  code: string;
  uses: number;
}

export interface BookRequestStats {
  title: string;
  author: string | null;
  loans_count: number;
}

export interface LoanStats {
  total: number;
  active: number;
  returned: number;
  overdue: number;
  popular_books: BookRequestStats[];
}

export interface VisitorStats {
  today: number;
  period_total: number;
  currently_inside: number;
  reasons: Record<string, number>;
}

export interface EventPopularityStats {
  id: string;
  name: string;
  attendees_count: number;
}

export interface EventStats {
  completed: number;
  upcoming: number;
  total_attendees: number;
  popular_events: EventPopularityStats[];
}

export interface GlobalStatisticsResponse {
  period: string;
  start_date: string;
  end_date: string;
  cubicles: CubicleStats[];
  loans: LoanStats;
  visitors: VisitorStats;
  events: EventStats;
}
