import type { CoachListing } from "@/lib/types";

export type TrustTier = "new" | "verified" | "preferred" | "parent_recommended";

export function trustTier(score: number): TrustTier {
  if (score >= 80) return "parent_recommended";
  if (score >= 60) return "preferred";
  if (score >= 40) return "verified";
  return "new";
}

export function trustTierLabel(tier: TrustTier): string {
  switch (tier) {
    case "new":
      return "New Coach";
    case "verified":
      return "Verified";
    case "preferred":
      return "Preferred by Girls";
    case "parent_recommended":
      return "Parent Recommended";
  }
}

export function trustTierStyles(tier: TrustTier): string {
  switch (tier) {
    case "new":
      return "bg-stone-100 text-stone-700 border-stone-200";
    case "verified":
      return "bg-teal-50 text-teal-800 border-teal-200";
    case "preferred":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "parent_recommended":
      return "bg-amber-50 text-amber-900 border-amber-200";
  }
}

export function trustBreakdown(coach: CoachListing) {
  const s = coach.trustScore;
  return {
    identity: Math.min(25, Math.round((s / 100) * 25)),
    sessions: Math.min(25, Math.round((s / 100) * 25)),
    rating: Math.min(25, Math.round((s / 100) * 25)),
    parent: Math.min(15, Math.round((s / 100) * 15)),
    response: Math.min(10, Math.round((s / 100) * 10)),
  };
}
