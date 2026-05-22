"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Btn } from "@/components/button";
import { coachListingIdFromUserKey } from "@/lib/coach-id";
import { formatCompactDate, formatUsd } from "@/lib/format";
import { useShePlays } from "@/providers/sheplays-provider";
import type { CoachListing, SessionType } from "@/lib/types";
const WEEKDAYS = [
  { id: 1, label: "Mon" },
  { id: 2, label: "Tue" },
  { id: 3, label: "Wed" },
  { id: 4, label: "Thu" },
  { id: 5, label: "Fri" },
] as const;
type DraftState = {
  title: string;
  sport: string;
  level: string;
  location: string;
  sessionType: SessionType;
  startsAtIso: string;
  durationMin: number;
  priceUsd: number;
  spotsTotal: number;
};
function newDraft(profile?: Pick<CoachListing, "sport" | "hourlyRateUsd">): DraftState {
  const start = new Date();
  start.setDate(start.getDate() + 2);
  start.setHours(17, 0, 0, 0);
  return {
    title: "",
    sport: profile?.sport ?? "",
    level: "Club",
    location: "",
    sessionType: "private",
    startsAtIso: start.toISOString(),
    durationMin: 60,
    priceUsd: profile?.hourlyRateUsd ?? 75,
    spotsTotal: 8,
  };
}
export default function CoachDashboardPage() {
  const router = useRouter();
  const seedOnce = useRef(false);
  const { ready, user, persisted, upsertCoachProfile, setAvailabilityRule, addSessionPost, resolveBookingRequest } =
    useShePlays();
  const coachListingId =
    user?.role === "coach" ? coachListingIdFromUserKey(user.key) : "";
  useEffect(() => {
    if (!ready || !user) router.replace("/auth/coach/login");
    else if (user.role !== "coach") router.replace("/");
    else if (!user.onboardingComplete) router.replace("/onboarding/coach");
  }, [ready, router, user]);
  const profile = coachListingId ? persisted.customCoaches[coachListingId] : undefined;
  const [draft, setDraft] = useState<DraftState>(() => newDraft());
  const [selectedDays, setSelectedDays] = useState<number[]>([2, 3, 5]);
  const privateUsd = profile?.hourlyRateUsd;
  const groupUsd = profile?.groupRateUsd;
  useEffect(() => {
    const slots = persisted.coachAvailabilityRule?.slots;
    if (!slots || !Object.keys(slots).length) return;
    const days = Object.keys(slots)
      .map(Number)
      .filter((n) => !Number.isNaN(n))
      .sort((a, b) => a - b);
    setSelectedDays(days);
  }, [persisted.coachAvailabilityRule?.slots]);
  useEffect(() => {
    if (!profile) return;
    if (!seedOnce.current) {
      seedOnce.current = true;
      setDraft(newDraft(profile));
    }
  }, [profile]);
  useEffect(() => {
    if (privateUsd == null) return;
    setDraft((d) => {
      const next =
        d.sessionType === "private"
          ? privateUsd
          : groupUsd ?? privateUsd;
      return d.priceUsd === next ? d : { ...d, priceUsd: next };
    });
  }, [draft.sessionType, privateUsd, groupUsd]);
  const pendingRequests = useMemo(
    () =>
      persisted.bookingRequests.filter(
        (r) => r.coachId === coachListingId && r.status === "pending",
      ),
    [coachListingId, persisted.bookingRequests],
  );
  const mySessions = useMemo(
    () => persisted.sessions.filter((s) => s.coachId === coachListingId),
    [coachListingId, persisted.sessions],
  );
  function persist(patch: Partial<CoachListing>) {
    if (!profile) return;
    upsertCoachProfile({ ...profile, ...patch });
  }
  function saveAvailability() {
    const hours = ["17:00", "18:00"];
    const slots: Record<number, string[]> = {};
    WEEKDAYS.forEach((d) => {
      if (selectedDays.includes(d.id)) slots[d.id] = [...hours];
    });
    setAvailabilityRule({ slots });
  }
  function publishSession() {
    if (!profile) return;
    addSessionPost({
      coachId: coachListingId,
      title:
        draft.title.trim() ||
        `${draft.sport || profile.sport} · ${draft.sessionType === "private" ? "Private pod" : "Group lab"}`,
      sport: draft.sport || profile.sport,
      level: draft.level,
      location: draft.location || profile.location,
      sessionType: draft.sessionType,
      startsAt: draft.startsAtIso,
      durationMin: draft.durationMin,
      priceUsd: draft.priceUsd,
      ...(draft.sessionType === "group"
        ? { spotsTotal: draft.spotsTotal, spotsLeft: draft.spotsTotal }
        : {}),
    });
    setDraft(newDraft(profile));
  }
  if (!ready || !user || user.role !== "coach")
    return <p className="text-sm text-[var(--sp-muted)]">Preparing HQ…</p>;
  if (!user.onboardingComplete)
    return <p className="text-sm text-[var(--sp-muted)]">Routing…</p>;
  if (!profile)
    return (
      <div className="mx-auto grid max-w-md gap-4">
        <h1 className="text-2xl font-semibold">Finish onboarding.</h1>
        <Btn variant="secondary" type="button" onClick={() => router.push("/onboarding/coach")}>
          Resume setup
        </Btn>
      </div>
    );
  const localDatetime = draft.startsAtIso.slice(0, 16);
  return (
    <div className="mx-auto grid max-w-3xl gap-10 pb-24 lg:max-w-none">
      <header className="flex flex-col gap-3 rounded-[2.5rem] border border-black/10 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--sp-muted)]">{profile.sport} HQ</p>
          <h1 className="text-3xl font-semibold">{profile.name}</h1>
          <p className="text-sm text-[var(--sp-muted)]">
            {""}
            <Link className="text-[var(--sp-teal)] underline-offset-4 hover:underline" href={`/coaches/${profile.id}`}>
              Discovery link
            </Link>
            {""}
            mirrors this hub.
          </p>
        </div>
        <Btn variant="secondary" type="button" onClick={() => router.push("/messages")}>
          Inbox
        </Btn>
      </header>
      <section className="rounded-[2rem] border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">Profile edits</h2>
        <p className="text-sm text-[var(--sp-muted)]">Readable bios keep Trust Scores feeling human.</p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-semibold">
            Spotlight bio
            <textarea
              rows={5}
              value={profile.bio}
              onChange={(e) => persist({ bio: e.target.value })}
              className="rounded-3xl border border-black/10 px-4 py-3 text-sm font-normal outline-none ring-[var(--sp-teal)] focus:ring-2"
            />
          </label>
          <div className="grid gap-4">
            <label className="flex flex-col gap-2 text-sm font-semibold">
              Private hourly (USD)
              <input
                type="number"
                inputMode="decimal"
                value={profile.hourlyRateUsd}
                onChange={(e) => persist({ hourlyRateUsd: Number(e.target.value) || 0 })}
                className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none ring-[var(--sp-teal)] focus:ring-2"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold">
              Group seat (USD)
              <input
                type="number"
                inputMode="decimal"
                value={profile.groupRateUsd ?? 0}
                onChange={(e) =>
                  persist({
                    groupRateUsd:
                      Number(e.target.value) > 0 ? Number(e.target.value) : undefined,
                  })
                }
                className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none ring-[var(--sp-teal)] focus:ring-2"
              />
            </label>
          </div>
        </div>
      </section>
      <section className="rounded-[2rem] border border-black/10 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Teaching rhythm</h2>
            <p className="text-sm text-[var(--sp-muted)]">Persisted weekdays for illustration.</p>
          </div>
          <Btn variant="secondary" type="button" onClick={() => saveAvailability()}>
            Save preset
          </Btn>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {WEEKDAYS.map((d) => (
            <button
              key={d.id}
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                selectedDays.includes(d.id)
                  ? "bg-[var(--sp-teal)] text-white"
                  : "border border-black/10 text-[var(--sp-muted)]"
              }`}
              onClick={() =>
                setSelectedDays((curr) =>
                  curr.includes(d.id)
                    ? curr.filter((x) => x !== d.id)
                    : [...curr, d.id].sort((a, b) => a - b),
                )
              }
            >
              {d.label}
            </button>
          ))}
        </div>
      </section>
      <section className="rounded-[2rem] border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">Capsules athletes will scroll</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold">
            Title
            <input
              value={draft.title}
              onChange={(e) => setDraft((s) => ({ ...s, title: e.target.value }))}
              className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none ring-[var(--sp-teal)] focus:ring-2"
            />
          </label>
          <label className="text-sm font-semibold">
            Starts
            <input
              type="datetime-local"
              value={localDatetime}
              onChange={(e) =>
                setDraft((s) => ({ ...s, startsAtIso: new Date(e.target.value).toISOString() }))
              }
              className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none ring-[var(--sp-teal)] focus:ring-2"
            />
          </label>
          <label className="text-sm font-semibold">
            Sport
            <input
              value={draft.sport}
              onChange={(e) => setDraft((s) => ({ ...s, sport: e.target.value }))}
              placeholder={profile.sport}
              className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none ring-[var(--sp-teal)] focus:ring-2"
            />
          </label>
          <label className="text-sm font-semibold">
            Athlete readiness
            <input
              value={draft.level}
              onChange={(e) => setDraft((s) => ({ ...s, level: e.target.value }))}
              className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none ring-[var(--sp-teal)] focus:ring-2"
            />
          </label>
          <label className="md:col-span-2 text-sm font-semibold">
            Location
            <input
              value={draft.location}
              onChange={(e) => setDraft((s) => ({ ...s, location: e.target.value }))}
              placeholder={profile.location}
              className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none ring-[var(--sp-teal)] focus:ring-2"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-6 text-sm font-semibold">
          <label className="flex items-center gap-2">
            <input type="radio" checked={draft.sessionType === "private"} onChange={() => setDraft((s) => ({ ...s, sessionType: "private" }))} />
            Private
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={draft.sessionType === "group"} onChange={() => setDraft((s) => ({ ...s, sessionType: "group" }))} />
            Group
          </label>
          {draft.sessionType === "group" ? (
            <label className="flex items-center gap-2 text-sm">
              Seats
              <input
                type="number"
                inputMode="numeric"
                min={4}
                value={draft.spotsTotal}
                onChange={(e) =>
                  setDraft((s) => ({
                    ...s,
                    spotsTotal: Math.max(Number.parseInt(e.target.value, 10) || 4, 2),
                  }))
                }
                className="w-24 rounded-xl border px-3 py-1 text-center text-sm"
              />
            </label>
          ) : null}
        </div>
        <label className="mt-5 block text-sm font-semibold">
          Athlete-facing price
          <input
            type="number"
            inputMode="decimal"
            value={draft.priceUsd}
            onChange={(e) => setDraft((s) => ({ ...s, priceUsd: Number(e.target.value) || 0 }))}
            className="mt-2 w-full max-w-sm rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none ring-[var(--sp-teal)] focus:ring-2"
          />
        </label>
        <Btn variant="primary" type="button" className="mt-6 px-12" onClick={() => publishSession()}>
          Publish capsule
        </Btn>
        <div className="mt-8 grid gap-3">
          {!mySessions.length ? (
            <p className="text-sm text-[var(--sp-muted)]">No capsules logged yet.</p>
          ) : (
            mySessions.slice(0, 6).map((session) => (
              <article key={session.id} className="rounded-3xl bg-[var(--sp-sand)] px-5 py-3 text-sm">
                <header className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{session.title}</p>
                  <span className="text-xs uppercase tracking-[0.2em] text-[var(--sp-muted)]">
                    {session.sessionType}
                  </span>
                </header>
                <p className="text-xs text-[var(--sp-muted)]">
                  {formatCompactDate(session.startsAt)} · {formatUsd(session.priceUsd)}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
      <section className="rounded-[2rem] border border-dashed border-[var(--sp-teal)]/40 bg-white p-6">
        <h2 className="text-xl font-semibold">Athlete outreach</h2>
        <p className="mt-2 text-sm text-[var(--sp-muted)]">
          Routed to {""}
          <code className="rounded bg-black/5 px-1 py-0.5 text-[11px]">{coachListingId}</code>
          .
        </p>
        {!pendingRequests.length ? (
          <p className="mt-6 text-sm text-[var(--sp-muted)]">Queue is serene.</p>
        ) : (
          <ul className="mt-6 grid gap-4">
            {pendingRequests.map((req) => (
              <li key={req.id} className="rounded-3xl border border-black/10 px-5 py-4">
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{req.studentName}</p>
                    <p className="text-xs text-[var(--sp-muted)]">
                      Requested {formatCompactDate(req.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Btn variant="primary" type="button" onClick={() => resolveBookingRequest(req.id, "accepted")}>
                      Accept
                    </Btn>
                    <Btn variant="ghost" type="button" onClick={() => resolveBookingRequest(req.id, "declined")}>
                      Decline
                    </Btn>
                  </div>
                </header>
                <p className="mt-3 text-sm text-[var(--sp-muted)]">{req.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
