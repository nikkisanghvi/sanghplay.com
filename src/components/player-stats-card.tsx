import type { PlayerStats } from "@/lib/player-stats";

const STAT_ITEMS: {
  key: keyof PlayerStats;
  label: string;
  format: (v: number) => string;
  emoji: string;
}[] = [
  { key: "totalSessions", label: "Sessions", format: (v) => String(v), emoji: "🏃" },
  { key: "hoursTrained", label: "Hours trained", format: (v) => (v % 1 ? v.toFixed(1) : String(v)), emoji: "⏱️" },
  { key: "weekSessions", label: "This week", format: (v) => String(v), emoji: "📅" },
  { key: "streakWeeks", label: "Week streak", format: (v) => `${v}w`, emoji: "🔥" },
  { key: "groupPods", label: "Group pods", format: (v) => String(v), emoji: "🤝" },
  { key: "sportsActive", label: "Sports", format: (v) => String(v), emoji: "🎯" },
];

type Props = {
  stats: PlayerStats;
  primarySport?: string;
};

export function PlayerStatsCard({ stats, primarySport }: Props) {
  return (
    <section className="sp-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--sp-teal)]">Player stats</p>
          <h2 className="font-display mt-1 text-xl font-semibold text-[var(--sp-ink)]">
            {primarySport ? `${primarySport} athlete` : "Your performance"}
          </h2>
        </div>
        <p className="rounded-full bg-[var(--sp-sand)] px-3 py-1 text-xs font-semibold text-[var(--sp-muted)]">
          Live from bookings
        </p>
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {STAT_ITEMS.map(({ key, label, format, emoji }) => (
          <li
            key={key}
            className="rounded-2xl border border-black/5 bg-[color-mix(in_oklab,var(--sp-sand)_50%,white)] px-3 py-3"
          >
            <span className="text-lg" aria-hidden>
              {emoji}
            </span>
            <p className="font-display mt-1 text-2xl font-bold text-[var(--sp-ink)]">{format(stats[key])}</p>
            <p className="text-xs font-medium text-[var(--sp-muted)]">{label}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
