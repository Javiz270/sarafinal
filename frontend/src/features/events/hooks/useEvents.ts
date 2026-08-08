import { useState, useCallback, useEffect } from 'react';
import { eventsApi } from '../api/events';
import type { Event, CreateEventRequest, EventAttendee, EventAttendeeRequest } from '../types';

export function useEvents() {
  const [data, setData] = useState<Event[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await eventsApi.getEvents();
      setData(res);
    } catch (err) {
      setIsError(true);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { data, isLoading, isError, error, refetch: fetchEvents };
}

export function useEvent(id: string) {
  const [data, setData] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchEvent = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await eventsApi.getEvent(id);
      setData(res);
    } catch (err) {
      setIsError(true);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  return { data, isLoading, isError, error, refetch: fetchEvent };
}

export function useEventAttendees(id: string) {
  const [data, setData] = useState<EventAttendee[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchAttendees = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await eventsApi.getEventAttendees(id);
      setData(res);
    } catch (err) {
      setIsError(true);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAttendees();
  }, [fetchAttendees]);

  return { data, isLoading, isError, error, refetch: fetchAttendees };
}

export function useCreateEvent() {
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);

  const mutate = async (data: CreateEventRequest, options?: { onSuccess?: (event: Event) => void }) => {
    setIsPending(true);
    setIsError(false);
    setError(null);
    try {
      const res = await eventsApi.createEvent(data);
      if (options?.onSuccess) options.onSuccess(res);
    } catch (err) {
      setIsError(true);
      setError(err);
    } finally {
      setIsPending(false);
    }
  };

  return { isPending, isError, error, mutate };
}

export function useRegisterAttendee() {
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);

  const mutate = async (eventId: string, data: EventAttendeeRequest, options?: { onSuccess?: () => void }) => {
    setIsPending(true);
    setIsError(false);
    setError(null);
    try {
      await eventsApi.registerAttendee(eventId, data);
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
