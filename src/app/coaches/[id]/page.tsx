"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Btn } from "@/components/button";
import { ClassCalendar } from "@/components/class-calendar";
import { bookingsToCalendarEvents, sessionsToCalendarEvents } from "@/lib/calendar-events";
import { TrustBadge } from "@/components/trust-badge";
import { SESSION_DURATIONS } from "@/lib/constants";
import { formatUsd } from "@/lib/format";
import { PLACEHOLDER_REVIEWS } from "@/lib/placeholder-data";
import { trustBreakdown } from "@/lib/trust";
import { useShePlays } from "@/providers/sheplays-provider";

const BADGE_LABELS: Record<string, string> = {
  responsive: "Responsive",
  trusted_parents: "Trusted by Parents",
  ten_girls: "10+ Girls Coached",
  preferred_girls: "Preferred by Girls",
  green_travel: "Green Travel",
};

export default function CoachProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { allCoaches, allSessions, user, ready, persisted, addBookingRequest, setLastCoachId } =
    useShePlays();
  const [note, setNote] = useState("Looking forward to training — flexible on weekends.");
  const [sent, setSent] = useState(false);
  const [coachDuo, setCoachDuo] = useState(false);
  const [duration, setDuration] = useState(60);
  const [calendarDate, setCalendarDate] = useState(() => new Date());

  const coach = useMemo(() => allCoaches.find((c) => c.id === params.id), [allCoaches, params.id]);
  const reviews = PLACEHOLDER_REVIEWS.filter((r) => r.coachId === params.id);
  const breakdown = coach ? trustBreakdown(coach) : null;

  const calendarEvents = useMemo(() => {
    if (!coach || !user) return [];
    const mine = bookingsToCalendarEvents(
      persisted.bookings.filter(
        (b) => b.studentKey === user.key && b.coachId === coach.id && b.status !== "cancelled",
      ),
    );
    const group = sessionsToCalendarEvents(
      allSessions.filter((s) => s.coachId === coach.id && s.sessionType === "group"),
      "peer",
    );
    return [...mine, ...group];
  }, [allSessions, coach, persisted.bookings, user]);

  const price =
    duration === 45
      ? (coach?.price45 ?? 0)
      : duration === 90
        ? (coach?.price90 ?? 0)
        : (coach?.price60 ?? coach?.hourlyRateUsd ?? 0);

  if (!ready) return <p className="text-sm text-[var(--sp-muted)]">Loading…</p>;

  if (!coach) {
    return (
      <div className="grid gap-4">
        <h1 className="text-2xl font-semibold">Coach not found.</h1>
        <Btn variant="secondary" type="button" onClick={() => router.push("/coaches")}>
          Back to explore
        </Btn>
      </div>
    );
  }

  function sendRequest() {
    if (!user || (user.role !== "student" && user.role !== "parent")) {
      router.push("/auth/student/login");
      return;
    }
    addBookingRequest({ coachId: coach!.id, message: note.trim() });
    setSent(true);
  }

  return (
    <div className="grid gap-8 pb-8">
      <div className="sp-card overflow-hidden p-0">
        <div className="sp-gradient-hero h-24" />
        <div className="relative px-6 pb-6">
          <Image
            src={coach.avatarUrl}
            alt=""
            width={120}
            height={120}
            className="-mt-14 h-28 w-28 rounded-2xl border-4 border-white object-cover shadow-lg"
          />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-bold">{coach.name}</h1>
            <TrustBadge coach={coach} />
          </div>
          <p className="text-[var(--sp-muted)]">
            {coach.sport} · {coach.isVirtual ? "Virtual" : coach.location}
          </p>
          <p className="mt-1 text-sm">
            ⭐ {coach.rating.toFixed(1)} ({coach.reviewCount} reviews)
          </p>
          {coach.greenTravel ? (
            <span className="mt-2 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
              🌿 Green Travel
            </span>
          ) : null}
        </div>
      </div>

      <p className="text-sm leading-relaxed">{coach.bio}</p>

      {breakdown ? (
        <section className="sp-card p-5">
          <h2 className="font-display font-semibold">Trust Score breakdown</h2>
          <ul className="mt-4 grid gap-2 text-sm">
            {[
              ["Identity + credentials", breakdown.identity, 25],
              ["Sessions completed", breakdown.sessions, 25],
              ["Student ratings", breakdown.rating, 25],
              ["Parent feedback", breakdown.parent, 15],
              ["Response time", breakdown.response, 10],
            ].map(([label, pts, max]) => (
              <li key={String(label)} className="flex justify-between gap-4">
                <span className="text-[var(--sp-muted)]">{label}</span>
                <span className="font-semibold">
                  {pts}/{max} ✅
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="sp-card p-5">
        <h2 className="font-display font-semibold">Badges</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {coach.badges.map((b) => (
            <span key={b} className="rounded-full bg-[var(--sp-sand)] px-3 py-1 text-xs font-semibold">
              {BADGE_LABELS[b] ?? b}
            </span>
          ))}
        </div>
      </section>

      <section className="sp-card p-5">
        <h2 className="font-display font-semibold">Book a session</h2>
        <p className="mt-1 text-sm text-[var(--sp-muted)]">
          Calendar shows your classes with this coach; open full booking for peer pods at your level.
        </p>
        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,300px)_1fr] lg:items-start">
          {user && (user.role === "student" || user.role === "parent") ? (
            <ClassCalendar
              events={calendarEvents}
              selectedDate={calendarDate}
              onSelectDate={setCalendarDate}
              onSelectEvent={(ev) => setCalendarDate(new Date(ev.startsAt))}
            />
          ) : null}
          <div>
            <div className="flex flex-wrap gap-2">
          {SESSION_DURATIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDuration(d)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                duration === d ? "bg-[var(--sp-violet)] text-white" : "bg-[var(--sp-sand)]"
              }`}
            >
              {d} min · {formatUsd(d === 45 ? coach.price45! : d === 90 ? coach.price90! : coach.price60!)}
            </button>
          ))}
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={coachDuo} onChange={() => setCoachDuo((v) => !v)} />
          Coach Duo — add female co-coach for first session
        </label>
        <div className="mt-4 flex flex-wrap gap-3">
          <Btn
            variant="primary"
            type="button"
            onClick={() => {
              setLastCoachId(coach.id);
              router.push(`/book/${coach.id}`);
            }}
          >
            Book classes · {formatUsd(price)}
          </Btn>
        </div>
        <p className="mt-2 text-xs text-[var(--sp-muted)]">Chat unlocks after booking is confirmed.</p>
          </div>
        </div>
      </section>

      <section className="sp-card p-5">
        <h2 className="font-display font-semibold">Reviews</h2>
        <ul className="mt-4 grid gap-4">
          {reviews.map((r) => (
            <li key={r.id} className="border-t border-black/5 pt-4 first:border-0 first:pt-0">
              <p className="text-xs font-semibold uppercase text-[var(--sp-muted)]">{r.role}</p>
              <p className="font-semibold">{r.author} · {"⭐".repeat(r.rating)}</p>
              <p className="mt-1 text-sm text-[var(--sp-muted)]">{r.body}</p>
            </li>
          ))}
          {!reviews.length ? <p className="text-sm text-[var(--sp-muted)]">No reviews yet.</p> : null}
        </ul>
      </section>

      <section className="sp-card border-dashed p-5">
        <h2 className="font-semibold">Send interest</h2>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="mt-3 w-full rounded-2xl border px-4 py-3 text-sm"
        />
        {sent ? <p className="mt-2 text-sm text-[var(--sp-teal)]">Request sent to coach inbox.</p> : null}
        <Btn variant="secondary" type="button" className="mt-3" onClick={() => sendRequest()}>
          Send request
        </Btn>
      </section>
    </div>
  );
}
