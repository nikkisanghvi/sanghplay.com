"use client";

export function ProgressRing({
  value,
  max,
  size = 88,
  label,
  gradientId = "sp-ring-grad",
}: {
  value: number;
  max: number;
  size?: number;
  label?: string;
  gradientId?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="color-mix(in oklab, var(--sp-violet) 12%, transparent)"
          strokeWidth={8}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--sp-violet)" />
            <stop offset="100%" stopColor="var(--sp-teal)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-xl font-bold text-[var(--sp-ink)]">{pct}%</span>
        <span className="text-[10px] font-medium text-[var(--sp-muted)]">
          {value}/{max}
        </span>
        {label ? (
          <span className="mt-0.5 text-[9px] uppercase tracking-wider text-[var(--sp-muted)]">{label}</span>
        ) : null}
      </div>
    </div>
  );
}
