"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Btn } from "@/components/button";
import { ClassCalendar } from "@/components/class-calendar";
import { PeerPlayPanel } from "@/components/peer-play-panel";
import {
  bookingsToCalendarEvents,
  dateKey,
  sessionsToCalendarEvents,
  slotIsoToDateKey,
} from "@/lib/calendar-events";
import { buildPrototypeSlots } from "@/lib/calendar-slots";
import { formatUsd } from "@/lib/format";
import { useShePlays } from "@/providers/sheplays-provider";
import type { CoachListing, SessionPost, SessionType } from "@/lib/types";

export default function BookingCalendarPage() {
  const params = useParams<{ coachId: string }>();
  const router = useRouter();
  const {
    allCoaches,
    allSessions,
    user,
    ready,
    persisted,
    createPendingBooking,
    updateStudentProfile,
  } = useShePlays();

  const [sessionType, setSessionType] = useState<SessionType>("private");
  const [selectedSlotIso, setSelectedSlotIso] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [peerPlay, setPeerPlay] = useState(false);

  const coach = useMemo(() => allCoaches.find((c) => c.id === params.coachId), [allCoaches, params.coachId]);
  const allSlots = useMemo(() => buildPrototypeSlots(21), []);

  const allowedTypes = useMemo(() => {
    const base = coach?.sessionTypes?.length ? coach.sessionTypes : (["private"] as SessionType[]);
    return base;
  }, [coach?.sessionTypes]);

  useEffect(() => {
    if (!allowedTypes.includes(sessionType)) {
      const pick = allowedTypes[0];
      if (pick) setSessionType(pick);
    }
  }, [allowedTypes, sessionType]);

  useEffect(() => {
    if (peerPlay && allowedTypes.includes("group")) setSessionType("group");
  }, [peerPlay, allowedTypes]);

  const activeType = allowedTypes.includes(sessionType) ? sessionType : allowedTypes[0] ?? "private";

  const computedPrice =
    activeType === "group"
      ? (coach?.groupRateUsd ?? (coach?.hourlyRateUsd ?? 0) + 15)
      : (coach?.hourlyRateUsd ?? 0);

  const myBookings = useMemo(
    () =>
      persisted.bookings.filter(
        (b) => b.studentKey === user?.key && b.status !== "cancelled",
      ),
    [persisted.bookings, user?.key],
  );

  const peerSessionsForCalendar = useMemo(() => {
    if (!coach) return [];
    return allSessions.filter((s) => s.coachId === coach.id && s.sessionType === "group");
  }, [allSessions, coach]);

  const calendarEvents = useMemo(() => {
    const mine = bookingsToCalendarEvents(myBookings);
    const peer = sessionsToCalendarEvents(peerSessionsForCalendar, "peer");
    const available = allSlots.map((s) => ({
      id: `slot-${s.id}`,
      startsAt: s.iso,
      title: "Open with coach",
      subtitle: coach?.name,
      kind: "available" as const,
    }));
    return [...mine, ...peer, ...available];
  }, [allSlots, coach?.name, myBookings, peerSessionsForCalendar]);

  const slotsForDay = useMemo(() => {
    const key = dateKey(selectedDate);
    return allSlots.filter((s) => slotIsoToDateKey(s.iso) === key);
  }, [allSlots, selectedDate]);

  if (!ready) return <p className="text-sm text-[var(--sp-muted)]">Scheduling…</p>;

  if (!coach) {
    return (
      <div className="grid gap-3">
        <h1 className="text-xl font-semibold">Coach unavailable.</h1>
        <Link className="text-[var(--sp-teal)] underline-offset-4 hover:underline" href="/coaches">
          Return to roster
        </Link>
      </div>
    );
  }

  if (!user || (user.role !== "student" && user.role !== "parent")) {
    return (
      <div className="grid max-w-xl gap-4 rounded-3xl border border-black/10 bg-white p-6">
        <h1 className="text-2xl font-semibold">Sign in to reserve time.</h1>
        <Btn variant="primary" type="button" onClick={() => router.push("/welcome")}>
          Get started
        </Btn>
      </div>
    );
  }

  function proceed() {
    if (!selectedSlotIso || !coach) return;
    const booking = createPendingBooking(coach, {
      startsAt: selectedSlotIso,
      sport: coach.sport,
      sessionType: activeType,
      amountUsd: computedPrice,
    });
    router.push(`/book/checkout?bookingId=${booking.id}`);
  }

  function joinPeerSession(session: SessionPost, sessionCoach: CoachListing) {
    const booking = createPendingBooking(sessionCoach, {
      startsAt: session.startsAt,
      sport: session.sport,
      sessionType: "group",
      amountUsd: session.priceUsd,
    });
    router.push(`/book/checkout?bookingId=${booking.id}`);
  }

  return (
    <div className="grid gap-8 pb-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--sp-teal)]">Book classes</p>
        <h1 className="font-display mt-2 text-3xl font-bold text-[var(--sp-ink)]">{coach.name}</h1>
        <p className="mt-2 text-sm text-[var(--sp-muted)]">
          Your calendar shows upcoming classes and open pods. Pick a date, then choose a time.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-start">
        <ClassCalendar
          events={calendarEvents}
          selectedDate={selectedDate}
          onSelectDate={(d) => {
            setSelectedDate(d);
            setSelectedSlotIso(null);
          }}
          onSelectEvent={(ev) => {
            setSelectedDate(new Date(ev.startsAt));
            if (ev.kind === "available" || ev.kind === "peer") {
              setSelectedSlotIso(ev.startsAt);
            }
          }}
        />

        <div className="grid gap-6">
          <PeerPlayPanel
            enabled={peerPlay}
            onEnabledChange={setPeerPlay}
            profile={persisted.studentProfile}
            coach={coach}
            allSessions={allSessions}
            allCoaches={allCoaches}
            onUpdateProfile={updateStudentProfile}
            onPickSession={joinPeerSession}
          />

          <section className="sp-card grid gap-5 p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display text-lg font-semibold">Pick a time</h2>
              <p className="text-sm font-semibold text-[var(--sp-ink)]">
                {formatUsd(computedPrice)}{" "}
                <span className="font-normal text-[var(--sp-muted)]">estimated</span>
              </p>
            </div>

            {!peerPlay ? (
              <div className="flex flex-wrap gap-2 text-sm font-medium">
                {allowedTypes.map((kind) => (
                  <label key={kind} className="flex items-center gap-2 rounded-full bg-[var(--sp-sand)] px-3 py-2">
                    <input
                      type="radio"
                      name="stype"
                      checked={activeType === kind}
                      onChange={() => setSessionType(kind)}
                    />
                    {kind === "private" ? "Private" : "Group"} lesson
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--sp-muted)]">
                Peer pods are group sessions — join from the list above or pick an open slot below.
              </p>
            )}

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--sp-muted)]">
              Slots on{" "}
              {new Intl.DateTimeFormat(undefined, {
                weekday: "long",
                month: "short",
                day: "numeric",
              }).format(selectedDate)}
            </p>

            {!slotsForDay.length ? (
              <p className="text-sm text-[var(--sp-muted)]">
                No open slots this day — choose another date on the calendar.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {slotsForDay.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlotIso(slot.iso)}
                    className={`rounded-2xl border px-3 py-3 text-left text-sm transition ${
                      selectedSlotIso === slot.iso
                        ? "border-[var(--sp-violet)] bg-[color-mix(in_oklab,var(--sp-violet)_10%,transparent)]"
                        : "border-black/10 hover:border-black/35"
                    }`}
                  >
                    <span className="font-semibold text-[var(--sp-ink)]">{slot.labelShort}</span>
                    <p className="text-xs text-[var(--sp-muted)]">Select, then continue to checkout</p>
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <Btn variant="primary" type="button" disabled={!selectedSlotIso} onClick={() => proceed()}>
                Continue to checkout
              </Btn>
              <Btn variant="secondary" type="button" onClick={() => router.back()}>
                Cancel
              </Btn>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

