import { api } from '../../../lib/api';
import type { Event, CreateEventRequest, EventAttendee, EventAttendeeRequest } from '../types';

export const eventsApi = {
  getEvents: () => 
    api.get<Event[]>('/api/events/'),

  getEvent: (id: string) => 
    api.get<Event>(`/api/events/${id}`),

  getEventAttendees: (id: string) => 
    api.get<EventAttendee[]>(`/api/events/${id}/attendees`),

  createEvent: (data: CreateEventRequest) => 
    api.post<Event>('/api/events/', data),

  registerAttendee: (eventId: string, data: EventAttendeeRequest) => 
    api.post<EventAttendee>(`/api/events/${eventId}/attendees`, data),
};
