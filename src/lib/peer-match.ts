import { locationContainsArea } from "@/lib/locations";
import type { CoachListing, SessionPost, StudentProfile } from "@/lib/types";

export const SKILL_LEVELS = [
  "Beginner",
  "Club",
  "Intermediate",
  "U-16",
  "High School",
  "Elite Prep",
] as const;

/** City / metro label before the comma in coach locations */
export function extractAreaLabel(location: string) {
  const part = location.split(",")[0]?.trim() ?? location.trim();
  return part.replace(/^Virtual\s*·\s*/i, "").trim();
}

export function normalizeArea(value: string) {
  return value.trim().toLowerCase();
}

export function levelMatches(sessionLevel: string, userLevel: string) {
  const a = sessionLevel.trim().toLowerCase();
  const b = userLevel.trim().toLowerCase();
  return a === b || a.includes(b) || b.includes(a);
}

export function sportMatches(sport: string, profile: Pick<StudentProfile, "sports">) {
  const needle = sport.trim().toLowerCase();
  return profile.sports.some(
    (s) => s.toLowerCase() === needle || needle.includes(s.toLowerCase().slice(0, 4)),
  );
}

export function areaMatches(location: string, userArea: string) {
  if (!userArea.trim() || !location.trim()) return false;
  return locationContainsArea(location, userArea);
}

export function peerPlayProfileDefaults(
  profile: StudentProfile | null,
  coach?: CoachListing,
): Required<Pick<StudentProfile, "sports" | "skillLevel" | "area">> {
  return {
    sports: profile?.sports?.length
      ? profile.sports
      : coach
        ? [coach.sport]
        : ["Cricket"],
    skillLevel: profile?.skillLevel ?? "Club",
    area: profile?.area ?? (coach ? extractAreaLabel(coach.location) : "Singapore"),
  };
}

export function sessionMatchesPeerPlay(
  session: SessionPost,
  coach: CoachListing | undefined,
  prefs: Pick<StudentProfile, "sports" | "skillLevel" | "area">,
) {
  if (session.sessionType !== "group") return false;
  if (!sportMatches(session.sport, prefs)) return false;
  if (!prefs.skillLevel || !levelMatches(session.level, prefs.skillLevel)) return false;
  if (!prefs.area) return false;

  const loc = session.location || coach?.location || "";
  if (!areaMatches(loc, prefs.area) && coach && !areaMatches(coach.location, prefs.area)) {
    return false;
  }

  const spots = session.spotsLeft ?? session.spotsTotal ?? 1;
  return spots > 0;
}
