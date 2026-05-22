/** Deterministic marketplace id used to align coach profiles & chat threads across demo + Supabase. */
export function coachListingIdFromUserKey(userKey: string) {
  const safe = userKey.trim().toLowerCase().replace("@", "-at-");
  const slug = safe
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `coach-${slug || "sheplays"}`;
}
