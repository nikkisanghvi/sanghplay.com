import type { PersistedState } from "@/lib/types";

const KEY = "sheplays:v2";

export const defaultPersistedState = (): PersistedState => ({
  version: 2,
  demoUser: null,
  customCoaches: {},
  sessions: [],
  bookings: [],
  bookingRequests: [],
  threads: [],
  coachAvailabilityRule: null,
  studentProfile: {
    sports: ["Cricket"],
    weeklySessionGoal: 2,
    skillLevel: "Club",
    area: "Singapore",
  },
  goals: [
    {
      id: "goal-weekly",
      label: "Weekly training sessions",
      type: "weekly_sessions",
      target: 2,
      current: 0,
    },
  ],
  earnedBadges: [],
  moodJournal: [],
});

export function loadPersistedState(): PersistedState {
  if (typeof window === "undefined") return defaultPersistedState();
  try {
    const raw = window.localStorage.getItem(KEY) ?? window.localStorage.getItem("sheplays:v1");
    if (!raw) return defaultPersistedState();
    const parsed = JSON.parse(raw) as PersistedState & { version?: number };
    const base = defaultPersistedState();
    return {
      ...base,
      ...parsed,
      version: 2,
      goals: parsed.goals?.length ? parsed.goals : base.goals,
      earnedBadges: parsed.earnedBadges ?? [],
      moodJournal: parsed.moodJournal ?? [],
      studentProfile: parsed.studentProfile ?? null,
    };
  } catch {
    return defaultPersistedState();
  }
}

export function savePersistedState(state: PersistedState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
}
