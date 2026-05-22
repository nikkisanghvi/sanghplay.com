import type { CoachListing } from "@/lib/types";
import { trustTier, trustTierLabel, trustTierStyles } from "@/lib/trust";

export function TrustBadge({ coach }: { coach: Pick<CoachListing, "trustScore"> }) {
  const tier = trustTier(coach.trustScore);
  const label = trustTierLabel(tier);
  const chip = trustTierStyles(tier);

  return (
    <div
      className={`flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold sm:text-xs ${chip}`}
    >
      <span className="font-mono tabular-nums">{coach.trustScore}</span>
      <span className="text-[10px] font-medium uppercase tracking-wide opacity-80">{label}</span>
    </div>
  );
}
