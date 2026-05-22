"use client";

import { useMemo, useState } from "react";

import { dateKey, type CalendarEvent } from "@/lib/calendar-events";
import { formatCompactDate } from "@/lib/format";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Props = {
  events: CalendarEvent[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onSelectEvent?: (event: CalendarEvent) => void;
  className?: string;
};

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, delta: number) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

export function ClassCalendar({
  events,
  selectedDate,
  onSelectDate,
  onSelectEvent,
  className = "",
}: Props) {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(selectedDate));

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of events) {
      const key = dateKey(new Date(ev.startsAt));
      const list = map.get(key) ?? [];
      list.push(ev);
      map.set(key, list);
    }
    return map;
  }, [events]);

  const grid = useMemo(() => {
    const first = startOfMonth(viewMonth);
    const startPad = first.getDay();
    const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startPad; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));
    }
    return cells;
  }, [viewMonth]);

  const selectedKey = dateKey(selectedDate);
  const dayEvents = eventsByDay.get(selectedKey) ?? [];

  const monthLabel = new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(viewMonth);

  return (
    <aside
      className={`flex flex-col gap-4 rounded-[1.75rem] border border-black/10 bg-[var(--sp-sand)]/60 p-4 sm:p-5 ${className}`}
    >
      <CalendarNav
        monthLabel={monthLabel}
        onPrev={() => setViewMonth((m) => addMonths(m, -1))}
        onNext={() => setViewMonth((m) => addMonths(m, 1))}
      />

      <CalendarGrid
        grid={grid}
        selectedKey={selectedKey}
        eventsByDay={eventsByDay}
        onSelectDate={onSelectDate}
      />

      <div className="border-t border-black/10 pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--sp-muted)]">
          {new Intl.DateTimeFormat(undefined, { weekday: "long", month: "short", day: "numeric" }).format(selectedDate)}
        </p>
        {!dayEvents.length ? (
          <p className="mt-2 text-sm text-[var(--sp-muted)]">No classes on this day yet.</p>
        ) : (
          <ul className="mt-3 grid max-h-48 gap-2 overflow-y-auto">
            {dayEvents
              .slice()
              .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
              .map((ev) => (
                <li key={ev.id}>
                  <button
                    type="button"
                    onClick={() => onSelectEvent?.(ev)}
                    className={`w-full rounded-2xl border px-3 py-2 text-left text-sm transition hover:border-[var(--sp-violet)] ${
                      ev.kind === "booking"
                        ? "border-[var(--sp-violet)]/30 bg-white"
                        : ev.kind === "peer"
                          ? "border-[var(--sp-teal)]/30 bg-white"
                          : "border-black/10 bg-white/80"
                    }`}
                  >
                    <p className="font-semibold text-[var(--sp-ink)]">{ev.title}</p>
                    <p className="text-xs text-[var(--sp-muted)]">
                      {formatCompactDate(ev.startsAt)}
                      {ev.subtitle ? ` · ${ev.subtitle}` : ""}
                    </p>
                    {ev.status === "pending_payment" ? (
                      <span className="mt-1 inline-block text-[10px] font-semibold uppercase text-amber-700">
                        Pending checkout
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
          </ul>
        )}
      </div>
      <CalendarLegend />
    </aside>
  );
}

function CalendarNav({
  monthLabel,
  onPrev,
  onNext,
}: {
  monthLabel: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <button
        type="button"
        aria-label="Previous month"
        className="grid h-9 w-9 place-items-center rounded-full border border-black/10 bg-white text-lg leading-none"
        onClick={onPrev}
      >
        ‹
      </button>
      <p className="font-display text-center text-sm font-semibold text-[var(--sp-ink)]">{monthLabel}</p>
      <button
        type="button"
        aria-label="Next month"
        className="grid h-9 w-9 place-items-center rounded-full border border-black/10 bg-white text-lg leading-none"
        onClick={onNext}
      >
        ›
      </button>
    </div>
  );
}

function CalendarGrid({
  grid,
  selectedKey,
  eventsByDay,
  onSelectDate,
}: {
  grid: (Date | null)[];
  selectedKey: string;
  eventsByDay: Map<string, CalendarEvent[]>;
  onSelectDate: (d: Date) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-[var(--sp-muted)]">
        {WEEKDAY_LABELS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {grid.map((day, i) => {
          if (!day) return <span key={`empty-${i}`} className="aspect-square" />;
          const key = dateKey(day);
          const count = eventsByDay.get(key)?.length ?? 0;
          const selected = key === selectedKey;
          const today = key === dateKey(new Date());
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(day)}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm font-medium transition ${
                selected
                  ? "bg-[var(--sp-violet)] text-white shadow-sm"
                  : today
                    ? "bg-white ring-2 ring-[var(--sp-coral)]/50"
                    : "bg-white/70 hover:bg-white"
              }`}
            >
              {day.getDate()}
              {count > 0 ? (
                <span className={`absolute bottom-1 flex gap-0.5 ${selected ? "opacity-90" : ""}`} aria-hidden>
                  {Array.from({ length: Math.min(count, 3) }).map((_, j) => (
                    <span
                      key={j}
                      className={`h-1 w-1 rounded-full ${selected ? "bg-white" : "bg-[var(--sp-teal)]"}`}
                    />
                  ))}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </>
  );
}

function CalendarLegend() {
  return (
    <div className="flex flex-wrap gap-3 text-[10px] font-medium text-[var(--sp-muted)]">
      <span className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-[var(--sp-violet)]" /> Your classes
      </span>
      <span className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-[var(--sp-teal)]" /> Peer / open pods
      </span>
    </div>
  );
}
