import { useState, useCallback, useEffect } from 'react';
import { statisticsApi } from '../api/statistics';
import type { GlobalStatisticsResponse } from '../types';

export function useGlobalStatistics(params?: { 
  period?: string; 
  start_date?: string; 
  end_date?: string; 
}) {
  const [data, setData] = useState<GlobalStatisticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await statisticsApi.getGlobalStatistics(params);
      setData(res);
    } catch (err) {
      setIsError(true);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [params?.period, params?.start_date, params?.end_date]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, isLoading, isError, error, refetch: fetchStats };
}
