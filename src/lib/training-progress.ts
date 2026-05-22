import type { Booking } from "@/lib/types";

export type ProgressPeriod = "week" | "month" | "year";

export type TrainingProgress = {
  period: ProgressPeriod;
  current: number;
  target: number;
  percent: number;
  label: string;
  rangeLabel: string;
};

function countable(bookings: Booking[]) {
  return bookings.filter((b) => b.status === "confirmed" || b.status === "past");
}

/** ISO week: Monday start */
export function startOfWeek(d: Date) {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function startOfYear(d: Date) {
  return new Date(d.getFullYear(), 0, 1);
}

function addPeriod(start: Date, period: ProgressPeriod) {
  const end = new Date(start);
  if (period === "week") end.setDate(end.getDate() + 7);
  else if (period === "month") end.setMonth(end.getMonth() + 1);
  else end.setFullYear(end.getFullYear() + 1);
  return end;
}

export function sessionsBetween(bookings: Booking[], start: Date, end: Date) {
  const startMs = start.getTime();
  const endMs = end.getTime();
  return countable(bookings).filter((b) => {
    const t = new Date(b.startsAt).getTime();
    return t >= startMs && t < endMs;
  });
}

export function targetForPeriod(weeklySessionGoal: number, period: ProgressPeriod) {
  const weekly = Math.max(1, weeklySessionGoal);
  if (period === "week") return weekly;
  if (period === "month") return weekly * 4;
  return weekly * 48;
}

export function formatRangeLabel(period: ProgressPeriod, now = new Date()) {
  if (period === "week") {
    const start = startOfWeek(now);
    const end = addPeriod(start, "week");
    end.setDate(end.getDate() - 1);
    return `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
  }
  if (period === "month") {
    return now.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  }
  return String(now.getFullYear());
}

export function computeTrainingProgress(
  bookings: Booking[],
  weeklySessionGoal: number,
  period: ProgressPeriod,
  now = new Date(),
): TrainingProgress {
  const start =
    period === "week" ? startOfWeek(now) : period === "month" ? startOfMonth(now) : startOfYear(now);
  const end = addPeriod(start, period);
  const current = sessionsBetween(bookings, start, end).length;
  const target = targetForPeriod(weeklySessionGoal, period);
  const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  const periodLabel = period === "week" ? "this week" : period === "month" ? "this month" : "this year";

  return {
    period,
    current,
    target,
    percent,
    label: periodLabel,
    rangeLabel: formatRangeLabel(period, now),
  };
}
