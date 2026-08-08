import { useState, useEffect, useCallback } from 'react';
import { loanApi } from '../api/loans';
import type { CreateLoanRequest, ReturnLoanRequest, LoanWithDetails, BarcodeLookup } from '../../../types/loan';

export function useLoans(status?: string) {
  const [data, setData] = useState<LoanWithDetails[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchLoans = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await loanApi.getLoans(status);
      setData(res);
    } catch (err) {
      setIsError(true);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  return { data, isLoading, isError, error, refetch: fetchLoans };
}

export function useMyLoans(status?: string) {
  const [data, setData] = useState<LoanWithDetails[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchLoans = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await loanApi.getMyLoans(status);
      setData(res);
    } catch (err) {
      setIsError(true);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  return { data, isLoading, isError, error, refetch: fetchLoans };
}

export function useBarcodeLookup() {
  const [data, setData] = useState<BarcodeLookup | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);

  const mutate = async (barcode: string) => {
    setIsPending(true);
    setIsError(false);
    setError(null);
    setData(null);
    try {
      const res = await loanApi.getByBarcode(barcode);
      setData(res);
    } catch (err) {
      setIsError(true);
      setError(err);
    } finally {
      setIsPending(false);
    }
  };

  return { data, isPending, isError, error, mutate };
}

export function useCreateLoan() {
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);

  const mutate = async (data: CreateLoanRequest, options?: { onSuccess?: () => void }) => {
    setIsPending(true);
    setIsError(false);
    setError(null);
    try {
      await loanApi.createLoan(data);
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

export function useReturnLoan() {
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);

  const mutate = async ({ id, data }: { id: string; data: ReturnLoanRequest }, options?: { onSuccess?: () => void }) => {
    setIsPending(true);
    setIsError(false);
    setError(null);
    try {
      await loanApi.returnLoan(id, data);
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

