"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import {
  defaultPersistedState,
  loadPersistedState,
  savePersistedState,
} from "@/lib/local-persist";
import { coachListingIdFromUserKey } from "@/lib/coach-id";
import {
  PLACEHOLDER_COACHES,
  PLACEHOLDER_SESSIONS,
} from "@/lib/placeholder-data";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import type {
  Booking,
  BookingRequest,
  ChatMessage,
  ChatThread,
  CoachListing,
  DemoUser,
  PersistedState,
  SessionPost,
  SessionType,
  UserRole,
} from "@/lib/types";

export type SessionUserSlice = {
  key: string;
  email: string;
  name: string;
  role: UserRole;
  onboardingComplete: boolean;
  source: "supabase" | "demo";
};

export type ShePlaysContextValue = {
  ready: boolean;
  supabaseMode: boolean;
  user: SessionUserSlice | null;
  persisted: PersistedState;
  allCoaches: CoachListing[];
  allSessions: SessionPost[];
  signInDemo: (
    email: string,
    name: string,
    role: UserRole,
    onboardingComplete?: boolean,
    extras?: { childName?: string },
  ) => void;
  signOut: () => Promise<void>;
  completeOnboarding: () => void;
  upsertCoachProfile: (coach: CoachListing) => void;
  setAvailabilityRule: (rule: PersistedState["coachAvailabilityRule"]) => void;
  addSessionPost: (
    session: Omit<SessionPost, "id" | "coachId"> & { coachId?: string },
  ) => void;
  addBookingRequest: (input: {
    coachId: string;
    message: string;
  }) => BookingRequest | null;
  resolveBookingRequest: (
    requestId: string,
    decision: "accepted" | "declined",
  ) => void;
  createPendingBooking: (
    coach: CoachListing,
    input: {
      startsAt: string;
      sport: string;
      sessionType: SessionType;
      amountUsd: number;
    },
  ) => Booking;
  confirmBookingPayment: (bookingId: string) => Booking | null;
  addChatMessage: (threadId: string, body: string) => void;
  ensureMentorThread: (
    mentorId: string,
    mentorName: string,
  ) => ChatThread | null;
  updateStudentProfile: (patch: Partial<import("@/lib/types").StudentProfile>) => void;
  incrementGoalProgress: (goalId: string, delta?: number) => void;
  awardBadge: (badge: Omit<import("@/lib/types").EarnedBadge, "awardedAt">) => void;
  logMood: (entry: Omit<import("@/lib/types").MoodEntry, "id" | "createdAt">) => void;
  setLastCoachId: (coachId: string) => void;
};

const ShePlaysContext = createContext<ShePlaysContextValue | null>(null);

function nanoidSimple() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2, 11)}`;
}

function userSliceFromDemo(demo: DemoUser): SessionUserSlice {
  return {
    key: demo.email.trim().toLowerCase(),
    email: demo.email.trim(),
    name: demo.name.trim(),
    role: demo.role,
    onboardingComplete: demo.onboardingComplete,
    source: "demo",
  };
}

async function userSliceFromSupabase(user: User): Promise<SessionUserSlice | null> {
  const md = user.user_metadata as Record<string, unknown>;
  const roleRaw = md?.role ?? md?.user_role;
  const role =
    roleRaw === "coach" ||
    roleRaw === "student" ||
    roleRaw === "parent" ||
    roleRaw === "mentor"
      ? (roleRaw as UserRole)
      : null;
  if (!role) return null;
  const name =
    typeof md?.full_name === "string" && md.full_name.trim().length > 0
      ? md.full_name
      : (user.email?.split("@")[0] ?? "Member");
  const onboardingRaw = md?.onboarding_complete;
  const onboardingComplete =
    onboardingRaw === true || onboardingRaw === "true";

  return {
    key: user.id,
    email: user.email ?? "",
    name,
    role,
    onboardingComplete,
    source: "supabase",
  };
}

function mergeCoachLists(base: CoachListing[], persisted: PersistedState): CoachListing[] {
  const map = new Map(base.map((c) => [c.id, { ...c }]));
  Object.values(persisted.customCoaches).forEach((c) => map.set(c.id, c));
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function mergeSessions(base: SessionPost[], persisted: PersistedState): SessionPost[] {
  const map = new Map(base.map((s) => [s.id, s]));
  persisted.sessions.forEach((s) => map.set(s.id, s));
  return Array.from(map.values()).sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );
}

function withBookingChatThread(booking: Booking, persisted: PersistedState): PersistedState {
  const alreadyHas = persisted.threads.some((t) => t.bookingId === booking.id);
  if (alreadyHas) return persisted;

  const thread: ChatThread = {
    id: nanoidSimple(),
    kind: "session",
    title: `${booking.sport} with ${booking.coachName}`,
    bookingId: booking.id,
    coachId: booking.coachId,
    participantKeys: [booking.studentKey, booking.coachId],
    participantNames: {
      [booking.studentKey]: booking.studentName,
      [booking.coachId]: booking.coachName,
    },
    messages: [
      {
        id: nanoidSimple(),
        authorKey: "__system",
        body:
          "You’re booked! Use this chat to coordinate arrival, gear, or quick questions.",
        createdAt: new Date().toISOString(),
      },
    ],
    updatedAt: new Date().toISOString(),
  };

  return { ...persisted, threads: [thread, ...persisted.threads] };
}

export function ShePlaysProvider({ children }: { children: React.ReactNode }) {
  const supabaseMode = isSupabaseConfigured();
  const supabase = useMemo(() => createSupabaseBrowserClient(), [supabaseMode]);

  const [ready, setReady] = useState(false);
  const [persisted, setPersisted] = useState<PersistedState>(defaultPersistedState);
  const [sbSession, setSbSession] = useState<Session | null>(null);
  const [sbUserSlice, setSbUserSlice] = useState<SessionUserSlice | null>(null);

  useEffect(() => {
    setPersisted(loadPersistedState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !supabaseMode || !supabase) return;

    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSbSession(data.session ?? null);
    });

    const sub = supabase.auth.onAuthStateChange((_evt, session) => {
      setSbSession(session);
    });

    return () => {
      cancelled = true;
      sub.data.subscription.unsubscribe();
    };
  }, [ready, supabaseMode, supabase]);

  useEffect(() => {
    if (!sbSession?.user || !supabaseMode) {
      setSbUserSlice(null);
      return;
    }

    let cancelled = false;

    async function hydrate() {
      if (!sbSession?.user) return;
      const slice = await userSliceFromSupabase(sbSession.user);
      if (!cancelled) setSbUserSlice(slice);
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [sbSession, supabaseMode]);

  useEffect(() => {
    savePersistedState(persisted);
  }, [persisted]);

  const user: SessionUserSlice | null = useMemo(() => {
    if (supabaseMode) return sbUserSlice;
    const demo = persisted.demoUser;
    if (!demo) return null;
    return userSliceFromDemo(demo);
  }, [persisted.demoUser, sbUserSlice, supabaseMode]);

  const allCoaches = useMemo(() => mergeCoachLists(PLACEHOLDER_COACHES, persisted), [persisted]);
  const allSessions = useMemo(
    () => mergeSessions(PLACEHOLDER_SESSIONS, persisted),
    [persisted],
  );

  const signInDemo = useCallback(
    (
      email: string,
      name: string,
      role: UserRole,
      onboardingComplete = false,
      extras?: { childName?: string },
    ) => {
      if (supabaseMode) return;
      setPersisted((p) => ({
        ...p,
        demoUser: {
          email: email.trim(),
          name: name.trim(),
          role,
          onboardingComplete,
          childName: extras?.childName,
        },
      }));
    },
    [supabaseMode],
  );

  const signOut = useCallback(async () => {
    if (supabaseMode && supabase) await supabase.auth.signOut();
    setPersisted((p) => ({
      ...p,
      demoUser: null,
    }));
  }, [supabase, supabaseMode]);

  const completeOnboarding = useCallback(() => {
    if (!user) return;
    if (!supabaseMode) {
      setPersisted((p) => {
        const du = p.demoUser;
        if (!du) return p;
        return { ...p, demoUser: { ...du, onboardingComplete: true } };
      });
      return;
    }
    if (!supabase) return;
    void supabase.auth.updateUser({ data: { onboarding_complete: true } });
  }, [supabase, supabaseMode, user]);

  const upsertCoachProfile = useCallback((coach: CoachListing) => {
    setPersisted((p) => ({
      ...p,
      customCoaches: {
        ...p.customCoaches,
        [coach.id]: coach,
      },
    }));
  }, []);

  const setAvailabilityRule = useCallback((rule: PersistedState["coachAvailabilityRule"]) => {
    setPersisted((p) => ({ ...p, coachAvailabilityRule: rule }));
  }, []);

  const addSessionPost = useCallback(
    (
      sessionInput: Omit<SessionPost, "id" | "coachId"> & { coachId?: string },
    ) => {
      if (!user || user.role !== "coach") return;

      let coachId = sessionInput.coachId ?? null;
      if (!coachId) {
        coachId =
          Object.values(persisted.customCoaches).find(
            (c) => c.name.trim().toLowerCase() === user.name.trim().toLowerCase(),
          )?.id ?? `coach-${user.key}`;
      }

      const next: SessionPost = {
        id: nanoidSimple(),
        coachId,
        title: sessionInput.title,
        sport: sessionInput.sport,
        level: sessionInput.level,
        location: sessionInput.location,
        sessionType: sessionInput.sessionType,
        startsAt: sessionInput.startsAt,
        durationMin: sessionInput.durationMin,
        priceUsd: sessionInput.priceUsd,
        spotsTotal: sessionInput.spotsTotal,
        spotsLeft: sessionInput.spotsLeft,
      };

      setPersisted((p) => ({
        ...p,
        sessions: [next, ...p.sessions.filter((s) => s.id !== next.id)],
      }));
    },
    [persisted.customCoaches, user],
  );

  const addBookingRequest = useCallback(
    (input: { coachId: string; message: string }) => {
      if (!user || (user.role !== "student" && user.role !== "parent")) return null;
      const req: BookingRequest = {
        id: nanoidSimple(),
        coachId: input.coachId,
        studentKey: user.key,
        studentName: user.name,
        message: input.message.trim(),
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      setPersisted((p) => ({
        ...p,
        bookingRequests: [req, ...p.bookingRequests],
      }));

      return req;
    },
    [user],
  );

  const resolveBookingRequest = useCallback(
    (requestId: string, decision: "accepted" | "declined") => {
      setPersisted((p) => ({
        ...p,
        bookingRequests: p.bookingRequests.map((r) =>
          r.id === requestId ? { ...r, status: decision === "accepted" ? "accepted" : "declined" } : r,
        ),
      }));
    },
    [],
  );

  const createPendingBooking = useCallback(
    (
      coach: CoachListing,
      input: {
        startsAt: string;
        sport: string;
        sessionType: SessionType;
        amountUsd: number;
        durationMin?: number;
        isVirtual?: boolean;
      },
    ) => {
      if (!user || (user.role !== "student" && user.role !== "parent")) {
        throw new Error("Only students or parents create bookings.");
      }

      const athleteName =
        user.role === "parent" && persisted.demoUser?.childName
          ? persisted.demoUser.childName
          : user.name;

      const booking: Booking = {
        id: nanoidSimple(),
        coachId: coach.id,
        coachName: coach.name,
        studentKey: user.key,
        studentName: athleteName,
        startsAt: input.startsAt,
        status: "pending_payment",
        sport: input.sport,
        sessionType: input.sessionType,
        amountUsd: input.amountUsd,
        durationMin: input.durationMin ?? 60,
        isVirtual: input.isVirtual ?? false,
        createdAt: new Date().toISOString(),
      };

      setPersisted((p) => ({
        ...p,
        bookings: [booking, ...p.bookings],
        lastCoachId: coach.id,
      }));

      return booking;
    },
    [persisted.demoUser?.childName, user],
  );

  const confirmBookingPayment = useCallback((bookingId: string) => {
    let bookingOut: Booking | null = null;

    setPersisted((prev) => {
      const bookings = prev.bookings.map((b) => {
        if (b.id !== bookingId) return b;
        bookingOut = { ...b, status: "confirmed" as const };
        return bookingOut;
      });

      if (!bookingOut) return prev;

      let after: PersistedState = { ...prev, bookings };

      after = withBookingChatThread(bookingOut, after);
      after = {
        ...after,
        goals: after.goals.map((g) =>
          g.type === "weekly_sessions" ? { ...g, current: Math.min(g.target, g.current + 1) } : g,
        ),
      };
      return after;
    });

    return bookingOut;
  }, []);

  const addChatMessage = useCallback(
    (threadId: string, body: string) => {
      if (!user || !body.trim()) return;

      const coachListingId =
        user.role === "coach"
          ? (persisted.customCoaches[
              coachListingIdFromUserKey(user.key)
            ]?.id ??
            Object.values(persisted.customCoaches).find(
              (c) => c.name.trim().toLowerCase() === user.name.trim().toLowerCase(),
            )?.id ??
            coachListingIdFromUserKey(user.key))
          : user.key;

      const authorKey = user.role === "coach" ? coachListingId : user.key;

      const msg: ChatMessage = {
        id: nanoidSimple(),
        authorKey,
        body: body.trim(),
        createdAt: new Date().toISOString(),
      };

      setPersisted((p) => ({
        ...p,
        threads: p.threads.map((t) =>
          t.id === threadId
            ? {
                ...t,
                messages: [...t.messages, msg],
                updatedAt: msg.createdAt,
                participantKeys: Array.from(new Set([...t.participantKeys, authorKey])),
              }
            : t,
        ),
      }));
    },
    [persisted.customCoaches, user],
  );

  const ensureMentorThread = useCallback((mentorId: string, mentorName: string) => {
    if (!user) return null;

    let resolved: ChatThread | null = null;

    setPersisted((prev) => {
      const exists = prev.threads.find((t) => t.kind === "mentor" && t.mentorId === mentorId);
      if (exists) {
        resolved = exists;
        return prev;
      }

      const thread: ChatThread = {
        id: nanoidSimple(),
        kind: "mentor",
        mentorId,
        coachId: undefined,
        title: mentorName,
        participantKeys: [user.key, mentorId],
        participantNames: { [user.key]: user.name, [mentorId]: mentorName },
        messages: [
          {
            id: nanoidSimple(),
            authorKey: mentorId,
            body: `Hi ${user.name.split(" ")[0] ?? ""}! Excited you're here — ask me anything about mindset, teamwork, or balance.`,
            createdAt: new Date().toISOString(),
          },
        ],
        updatedAt: new Date().toISOString(),
      };

      resolved = thread;
      return { ...prev, threads: [thread, ...prev.threads] };
    });

    return resolved;
  }, [user]);

  const updateStudentProfile = useCallback((patch: Partial<import("@/lib/types").StudentProfile>) => {
    setPersisted((p) => ({
      ...p,
      studentProfile: { ...(p.studentProfile ?? { sports: [], weeklySessionGoal: 2 }), ...patch },
    }));
  }, []);

  const incrementGoalProgress = useCallback((goalId: string, delta = 1) => {
    setPersisted((p) => ({
      ...p,
      goals: p.goals.map((g) =>
        g.id === goalId ? { ...g, current: Math.min(g.target, g.current + delta) } : g,
      ),
    }));
  }, []);

  const awardBadge = useCallback((badge: Omit<import("@/lib/types").EarnedBadge, "awardedAt">) => {
    setPersisted((p) => {
      if (p.earnedBadges.some((b) => b.id === badge.id)) return p;
      return {
        ...p,
        earnedBadges: [
          { ...badge, awardedAt: new Date().toISOString() },
          ...p.earnedBadges,
        ],
      };
    });
  }, []);

  const logMood = useCallback((entry: Omit<import("@/lib/types").MoodEntry, "id" | "createdAt">) => {
    setPersisted((p) => ({
      ...p,
      moodJournal: [
        { ...entry, id: nanoidSimple(), createdAt: new Date().toISOString() },
        ...p.moodJournal,
      ],
    }));
  }, []);

  const setLastCoachId = useCallback((coachId: string) => {
    setPersisted((p) => ({ ...p, lastCoachId: coachId }));
  }, []);

  const value = useMemo<ShePlaysContextValue>(
    () => ({
      ready,
      supabaseMode,
      user,
      persisted,
      allCoaches,
      allSessions,
      signInDemo,
      signOut,
      completeOnboarding,
      upsertCoachProfile,
      setAvailabilityRule,
      addSessionPost,
      addBookingRequest,
      resolveBookingRequest,
      createPendingBooking,
      confirmBookingPayment,
      addChatMessage,
      ensureMentorThread,
      updateStudentProfile,
      incrementGoalProgress,
      awardBadge,
      logMood,
      setLastCoachId,
    }),
    [
      addBookingRequest,
      addChatMessage,
      addSessionPost,
      allCoaches,
      allSessions,
      awardBadge,
      completeOnboarding,
      confirmBookingPayment,
      createPendingBooking,
      ensureMentorThread,
      incrementGoalProgress,
      logMood,
      persisted,
      ready,
      resolveBookingRequest,
      setAvailabilityRule,
      setLastCoachId,
      signInDemo,
      signOut,
      supabaseMode,
      updateStudentProfile,
      upsertCoachProfile,
      user,
    ],
  );

  return <ShePlaysContext.Provider value={value}>{children}</ShePlaysContext.Provider>;
}

export function useShePlays(): ShePlaysContextValue {
  const ctx = useContext(ShePlaysContext);
  if (!ctx) throw new Error("useShePlays must be used within ShePlaysProvider");
  return ctx;
}
