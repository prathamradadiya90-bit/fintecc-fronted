export type CalendarEventType = 'NOTE' | 'WORK' | 'MEETING' | 'REMINDER' | 'OTHER';
export type CalendarPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO date string
  endDate?: string;
  allDay?: boolean;
  type: 'CUSTOM' | 'TASK' | 'COMPLIANCE';
  eventType?: CalendarEventType;
  priority?: CalendarPriority;
  color?: string;
  isRecurring?: boolean;
  clientId?: string;
  clientName?: string | null;
  status?: string;
}

export interface UnifiedCalendarResponse {
  success: boolean;
  message?: string;
  data: CalendarEvent[];
}

export interface SingleCalendarEventResponse {
  success: boolean;
  message?: string;
  data: CalendarEvent;
}

export interface GetCalendarParams {
  month?: string; // "1" to "12"
  year?: string;  // e.g. "2026"
  clientId?: string;
  priority?: CalendarPriority;
}

export interface CreateCalendarEventRequest {
  title: string;
  description?: string;
  eventType?: CalendarEventType;
  priority?: CalendarPriority;
  color?: string;
  startDate: string; // ISO datetime
  endDate?: string;
  allDay?: boolean;
  clientId?: string | null;
  isPrivate?: boolean;
}

export interface UpdateCalendarEventRequest {
  title?: string;
  description?: string;
  eventType?: CalendarEventType;
  priority?: CalendarPriority;
  color?: string;
  startDate?: string;
  endDate?: string;
  allDay?: boolean;
  clientId?: string | null;
  isPrivate?: boolean;
}
