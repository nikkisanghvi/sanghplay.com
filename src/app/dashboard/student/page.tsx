"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Btn } from "@/components/button";
import { ClassCalendar } from "@/components/class-calendar";
import { CoachCard } from "@/components/coach-card";
import { CompletionCircle } from "@/components/completion-circle";
import { PlayerStatsCard } from "@/components/player-stats-card";
import { SponsorMeCard } from "@/components/sponsor-me-card";
import { bookingsToCalendarEvents } from "@/lib/calendar-events";
import { formatCompactDate } from "@/lib/format";
import { computePlayerStats } from "@/lib/player-stats";
import { PLACEHOLDER_MENTORS, PLACEHOLDER_NEWS, quoteOfTheDay } from "@/lib/placeholder-data";
import { useShePlays } from "@/providers/sheplays-provider";

export default function StudentDashboardPage() {
  const router = useRouter();
  const { ready, user, allCoaches, persisted, updateStudentProfile } = useShePlays();
  const quote = quoteOfTheDay();
  const [calendarDate, setCalendarDate] = useState(() => new Date());

  useEffect(() => {
    if (!ready || !user) router.replace("/welcome");
    else if (user.role !== "student") router.replace("/");
    else if (!user.onboardingComplete) router.replace("/onboarding/student");
  }, [ready, router, user]);

  const myBookings = persisted.bookings.filter(
    (b) => b.studentKey === user?.key && b.status !== "cancelled",
  );
  const confirmed = myBookings.filter((b) => b.status === "confirmed");
  const calendarEvents = bookingsToCalendarEvents(myBookings);
  const nextSession = confirmed.sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  )[0];
  const nextCoach = nextSession ? allCoaches.find((c) => c.id === nextSession.coachId) : null;

  const sports = persisted.studentProfile?.sports ?? ["Cricket"];
  const weeklySessionGoal = persisted.studentProfile?.weeklySessionGoal ?? 2;
  const playerStats = useMemo(
    () => computePlayerStats(myBookings, sports),
    [myBookings, sports],
  );
  const suggested = useMemo(
    () =>
      allCoaches
        .filter((c) => sports.some((s) => c.sport.toLowerCase().includes(s.toLowerCase().slice(0, 4))))
        .slice(0, 6),
    [allCoaches, sports],
  );

  const sportNews = PLACEHOLDER_NEWS.filter(
    (n) => n.sport === "All" || sports.some((s) => n.sport.includes(s.split(" ")[0] ?? "")),
  ).slice(0, 3);

  const spotlight = PLACEHOLDER_MENTORS[0]!;
  const lastCoach = persisted.lastCoachId
    ? allCoaches.find((c) => c.id === persisted.lastCoachId)
    : null;

  if (!ready || !user || user.role !== "student" || !user.onboardingComplete) {
    return <p className="text-sm text-[var(--sp-muted)]">Loading your hub…</p>;
  }

  const firstName = user.name.split(" ")[0];

  return (
    <div className="grid gap-8 pb-4">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--sp-teal)]">Athlete hub</p>
        <h1 className="font-display mt-2 text-3xl font-bold text-[var(--sp-ink)] sm:text-4xl">
          Hi {firstName}! Ready to train today?
        </h1>
      </header>

      <blockquote className="sp-card border-l-4 border-l-[var(--sp-coral)] px-5 py-4 italic">
        <p className="font-display text-lg font-semibold text-[var(--sp-ink)]">&ldquo;{quote.text}&rdquo;</p>
        <footer className="mt-2 text-sm text-[var(--sp-muted)]">— {quote.author}</footer>
      </blockquote>

      <PlayerStatsCard stats={playerStats} primarySport={sports[0]} />

      <CompletionCircle bookings={myBookings} weeklySessionGoal={weeklySessionGoal} />

      <SponsorMeCard
        athleteName={user.name}
        studentKey={user.key}
        profile={persisted.studentProfile}
        onUpdateProfile={updateStudentProfile}
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,280px)_1fr]">
        <ClassCalendar
          className="bg-white/90"
          events={calendarEvents}
          selectedDate={calendarDate}
          onSelectDate={setCalendarDate}
        />
        <div className="sp-gradient-hero flex flex-col justify-center rounded-2xl p-5 text-white shadow-lg">
          <p className="text-xs uppercase tracking-[0.25em] text-white/70">Next class · book more</p>
          {nextSession && nextCoach ? (
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <Image
                  src={nextCoach.avatarUrl}
                  alt=""
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white/30"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-display font-semibold">{nextCoach.name}</p>
                  <p className="text-sm text-white/85">
                    {nextSession.sport} · {formatCompactDate(nextSession.startsAt)}
                  </p>
                </div>
              </div>
              <Btn
                variant="secondary"
                type="button"
                className="shrink-0 border-white/30 bg-white/20 text-white hover:bg-white/30"
                onClick={() => router.push(`/book/${nextCoach.id}`)}
              >
                Book classes
              </Btn>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <p className="text-sm text-white/85">No upcoming sessions — find a coach to book your first!</p>
              <Btn
                variant="secondary"
                type="button"
                className="border-white/30 bg-white/20 text-white hover:bg-white/30"
                onClick={() => router.push("/coaches")}
              >
                Book classes
              </Btn>
            </div>
          )}
        </div>
      </section>

      {lastCoach ? (
        <Btn variant="primary" type="button" className="w-full" onClick={() => router.push(`/book/${lastCoach.id}`)}>
          Quick re-book with {lastCoach.name.split(" ")[0]}
        </Btn>
      ) : null}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Suggested coaches</h2>
          <Link href="/coaches" className="text-sm font-semibold text-[var(--sp-violet)]">
            See all
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {suggested.map((coach) => (
            <div key={coach.id} className="w-[min(85vw,280px)] shrink-0">
              <CoachCard coach={coach} />
            </div>
          ))}
        </div>
      </section>

      <section className="sp-card-dark p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-white/60">Mentor spotlight</p>
        <div className="mt-4 flex gap-4">
          <Image
            src={spotlight.avatarUrl}
            alt=""
            width={80}
            height={80}
            className="h-20 w-20 rounded-2xl object-cover"
          />
          <div>
            <p className="font-display font-semibold">{spotlight.name}</p>
            <p className="text-sm text-white/70">{spotlight.sport}</p>
            <p className="mt-2 line-clamp-2 text-sm text-white/85">{spotlight.bio}</p>
            <Link href="/mentorship" className="mt-3 inline-block text-sm font-semibold text-[var(--sp-coral)]">
              Meet mentors →
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Sport news</h2>
          <Link href="/news" className="text-sm font-semibold text-[var(--sp-violet)]">
            Feed
          </Link>
        </div>
        <ul className="grid gap-3">
          {sportNews.map((item) => (
            <li key={item.id} className="sp-card px-4 py-3">
              <p className="text-xs font-semibold uppercase text-[var(--sp-teal)]">{item.sport}</p>
              <p className="mt-1 font-semibold text-[var(--sp-ink)]">{item.title}</p>
              <p className="mt-1 text-sm text-[var(--sp-muted)]">{item.excerpt}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
