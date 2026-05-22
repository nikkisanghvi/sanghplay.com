"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Btn } from "@/components/button";
import { ProgressRing } from "@/components/progress-ring";
import { DEFAULT_BADGES } from "@/lib/placeholder-data";
import { useShePlays } from "@/providers/sheplays-provider";

const MOODS = ["😔", "😕", "😐", "🙂", "😄"];

export default function GoalsPage() {
  const router = useRouter();
  const { ready, user, persisted, logMood, awardBadge } = useShePlays();
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!ready || !user) router.replace("/welcome");
    else if (user.role !== "student") router.replace("/");
  }, [ready, router, user]);

  if (!ready || !user || user.role !== "student") {
    return <p className="text-sm text-[var(--sp-muted)]">Loading…</p>;
  }

  const weekly = persisted.goals.find((g) => g.type === "weekly_sessions");

  function unlockDemoBadge() {
    awardBadge({ id: "consistency", emoji: "⭐", title: "Consistency Star" });
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  }

  return (
    <div className="relative grid gap-8 pb-4">
      {showConfetti ? (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          <p className="animate-bounce rounded-2xl bg-[var(--sp-violet)] px-6 py-4 text-lg font-bold text-white shadow-xl">
            Badge unlocked! ⭐
          </p>
        </div>
      ) : null}

      <header>
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--sp-teal)]">Goals</p>
        <h1 className="font-display text-3xl font-bold">Track & celebrate</h1>
      </header>

      <section className="sp-card flex items-center gap-4 p-5">
        <ProgressRing value={weekly?.current ?? 0} max={weekly?.target ?? 2} label="week" />
        <div>
          <p className="font-semibold">{weekly?.label ?? "Weekly sessions"}</p>
          <p className="text-sm text-[var(--sp-muted)]">Target: {weekly?.target ?? 2} sessions / week</p>
        </div>
      </section>

      <section>
        <h2 className="font-display mb-3 text-xl font-semibold">Skill goals</h2>
        <ul className="grid gap-2">
          {persisted.goals
            .filter((g) => g.type !== "weekly_sessions")
            .concat([
              {
                id: "skill-backhand",
                label: "Improve backhand",
                type: "skill" as const,
                target: 10,
                current: 3,
              },
            ])
            .map((g) => (
              <li key={g.id} className="sp-card flex justify-between px-4 py-3 text-sm">
                <span>{g.label}</span>
                <span className="font-semibold text-[var(--sp-violet)]">
                  {g.current}/{g.target}
                </span>
              </li>
            ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display mb-3 text-xl font-semibold">Badge wall</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {DEFAULT_BADGES.map((b) => {
            const earned = persisted.earnedBadges.find((e) => e.id === b.id);
            return (
              <div
                key={b.id}
                className={`sp-card p-4 text-center ${earned ? "ring-2 ring-[var(--sp-gold)]" : "opacity-50"}`}
              >
                <span className="text-3xl">{b.emoji}</span>
                <p className="mt-2 text-xs font-semibold">{b.title}</p>
              </div>
            );
          })}
        </div>
        <Btn variant="secondary" type="button" className="mt-4 w-full" onClick={() => unlockDemoBadge()}>
          Demo: unlock Consistency Star
        </Btn>
      </section>

      <section className="sp-card p-5">
        <h2 className="font-display text-lg font-semibold">Post-session mood</h2>
        <p className="mt-1 text-sm text-[var(--sp-muted)]">How did you feel? (optional share with mentor)</p>
        <div className="mt-4 flex justify-between gap-2">
          {MOODS.map((emoji, i) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setMood((i + 1) as 1 | 2 | 3 | 4 | 5)}
              className={`text-2xl rounded-2xl p-2 ${mood === i + 1 ? "bg-[var(--sp-blush)] ring-2 ring-[var(--sp-coral)]" : ""}`}
            >
              {emoji}
            </button>
          ))}
        </div>
        <Btn
          variant="primary"
          type="button"
          className="mt-4 w-full"
          onClick={() => logMood({ mood, sharedWithMentor: false })}
        >
          Save journal entry
        </Btn>
      </section>
    </div>
  );
}
