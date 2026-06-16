export type Recurrence = "none" | "daily" | "weekly" | "monthly";
export type EventStatus = "Scheduled" | "Completed" | "Cancelled";

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  attendees: string[];
  recurrence: Recurrence;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}
