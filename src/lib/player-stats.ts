import { sessionsBetween, startOfMonth, startOfWeek } from "@/lib/training-progress";
import type { Booking } from "@/lib/types";

export type PlayerStats = {
  totalSessions: number;
  hoursTrained: number;
  groupPods: number;
  sportsActive: number;
  weekSessions: number;
  monthSessions: number;
  streakWeeks: number;
};

function countable(bookings: Booking[]) {
  return bookings.filter((b) => b.status === "confirmed" || b.status === "past");
}

function countStreakWeeks(bookings: Booking[], now = new Date()) {
  let streak = 0;
  let cursor = startOfWeek(now);

  for (let i = 0; i < 52; i++) {
    const end = new Date(cursor);
    end.setDate(end.getDate() + 7);
    const count = sessionsBetween(bookings, cursor, end).length;
    if (count > 0) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 7);
    } else break;
  }
  return streak;
}

export function computePlayerStats(
  bookings: Booking[],
  sports: string[],
  now = new Date(),
): PlayerStats {
  const done = countable(bookings);
  const hoursTrained = Math.round((done.reduce((sum, b) => sum + b.durationMin, 0) / 60) * 10) / 10;
  const sportsFromBookings = new Set(done.map((b) => b.sport));
  sports.forEach((s) => sportsFromBookings.add(s));

  const weekStart = startOfWeek(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const monthStart = startOfMonth(now);
  const monthEnd = new Date(monthStart);
  monthEnd.setMonth(monthEnd.getMonth() + 1);

  return {
    totalSessions: done.length,
    hoursTrained,
    groupPods: done.filter((b) => b.sessionType === "group").length,
    sportsActive: sportsFromBookings.size,
    weekSessions: sessionsBetween(bookings, weekStart, weekEnd).length,
    monthSessions: sessionsBetween(bookings, monthStart, monthEnd).length,
    streakWeeks: countStreakWeeks(bookings, now),
  };
}
