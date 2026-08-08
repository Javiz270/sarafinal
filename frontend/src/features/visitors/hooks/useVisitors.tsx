import { useState, useCallback, useEffect } from 'react';
import { visitorsApi } from '../api/visitors';
import type { Visitor, CreateVisitorRequest } from '../types';

export function useVisitors(params?: { 
  date_filter?: string; 
  search?: string; 
  reason?: string; 
  inside_only?: boolean 
}) {
  const [data, setData] = useState<Visitor[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchVisitors = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await visitorsApi.getVisitors(params);
      setData(res);
    } catch (err) {
      setIsError(true);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [params?.date_filter, params?.search, params?.reason, params?.inside_only]);

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  return { data, isLoading, isError, error, refetch: fetchVisitors };
}

export function useCreateVisitor() {
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);

  const mutate = async (data: CreateVisitorRequest, options?: { onSuccess?: () => void }) => {
    setIsPending(true);
    setIsError(false);
    setError(null);
    try {
      await visitorsApi.createVisitor(data);
      if (options?.onSuccess) options.onSuccess();
    } catch (err) {
      setIsError(true);
      setError(err);
    } finally {
      setIsPending(false);
    }
  };

  return { isPending, isError, error, mutate };
}

export function useCheckoutVisitor() {
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);

  const mutate = async (id: string, options?: { onSuccess?: () => void }) => {
    setIsPending(true);
    setIsError(false);
    setError(null);
    try {
      await visitorsApi.checkoutVisitor(id);
      if (options?.onSuccess) options.onSuccess();
    } catch (err) {
      setIsError(true);
      setError(err);
    } finally {
      setIsPending(false);
    }
  };

  return { isPending, isError, error, mutate };
}
