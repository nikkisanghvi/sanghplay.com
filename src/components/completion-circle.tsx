"use client";

import { useMemo, useState } from "react";

import { ProgressRing } from "@/components/progress-ring";
import {
  computeTrainingProgress,
  type ProgressPeriod,
} from "@/lib/training-progress";
import type { Booking } from "@/lib/types";

const PERIODS: { id: ProgressPeriod; label: string }[] = [
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
];

type Props = {
  bookings: Booking[];
  weeklySessionGoal: number;
};

export function CompletionCircle({ bookings, weeklySessionGoal }: Props) {
  const [period, setPeriod] = useState<ProgressPeriod>("week");

  const progress = useMemo(
    () => computeTrainingProgress(bookings, weeklySessionGoal, period),
    [bookings, period, weeklySessionGoal],
  );

  return (
    <section className="sp-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-lg font-semibold text-[var(--sp-ink)]">Completion circle</p>
          <p className="text-sm text-[var(--sp-muted)]">
            Training progress · {progress.rangeLabel}
          </p>
        </div>
        <div
          className="flex gap-1 rounded-2xl bg-[var(--sp-sand)] p-1"
          role="tablist"
          aria-label="Progress period"
        >
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={period === p.id}
              onClick={() => setPeriod(p.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                period === p.id
                  ? "bg-white text-[var(--sp-ink)] shadow-sm"
                  : "text-[var(--sp-muted)] hover:text-[var(--sp-ink)]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
        <ProgressRing
          value={progress.current}
          max={progress.target}
          size={132}
          label={period}
          gradientId={`completion-${period}`}
        />
        <div className="text-center sm:text-left">
          <p className="font-display text-2xl font-bold text-[var(--sp-ink)]">{progress.percent}%</p>
          <p className="mt-1 text-sm text-[var(--sp-muted)]">
            <span className="font-semibold text-[var(--sp-ink)]">{progress.current}</span> of{" "}
            <span className="font-semibold text-[var(--sp-ink)]">{progress.target}</span> sessions{" "}
            {progress.label}
          </p>
          {progress.percent >= 100 ? (
            <p className="mt-2 text-sm font-semibold text-[var(--sp-teal)]">Goal crushed — keep the momentum!</p>
          ) : (
            <p className="mt-2 text-sm text-[var(--sp-muted)]">
              {progress.target - progress.current} more to hit your {period} target.
            </p>
          )}
          <a href="/goals" className="mt-3 inline-block text-sm font-semibold text-[var(--sp-violet)]">
            Goals & badges →
          </a>
        </div>
      </div>
    </section>
  );
}
