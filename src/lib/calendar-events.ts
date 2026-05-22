import type { Booking, SessionPost } from "@/lib/types";

export type CalendarEventKind = "booking" | "available" | "peer";

export type CalendarEvent = {
  id: string;
  startsAt: string;
  title: string;
  kind: CalendarEventKind;
  subtitle?: string;
  status?: Booking["status"];
};

export function dateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function bookingsToCalendarEvents(bookings: Booking[]): CalendarEvent[] {
  return bookings.map((b) => ({
    id: b.id,
    startsAt: b.startsAt,
    title: b.sport,
    subtitle: b.coachName,
    kind: "booking",
    status: b.status,
  }));
}

export function sessionsToCalendarEvents(
  sessions: SessionPost[],
  kind: CalendarEventKind = "peer",
): CalendarEvent[] {
  return sessions.map((s) => ({
    id: s.id,
    startsAt: s.startsAt,
    title: s.title,
    subtitle: `${s.level} · ${s.location}`,
    kind,
  }));
}

export function slotIsoToDateKey(iso: string) {
  return dateKey(new Date(iso));
}
