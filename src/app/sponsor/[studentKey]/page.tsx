"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { Btn } from "@/components/button";
import { PlayerStatsCard } from "@/components/player-stats-card";
import { computePlayerStats } from "@/lib/player-stats";
import { useShePlays } from "@/providers/sheplays-provider";

export default function SponsorAthletePage() {
  const params = useParams();
  const studentKey = decodeURIComponent(String(params.studentKey ?? ""));
  const { ready, persisted, user } = useShePlays();

  const isOwner = user?.key === studentKey;
  const profile = persisted.studentProfile;
  const bookings = persisted.bookings.filter(
    (b) => b.studentKey === studentKey && b.status !== "cancelled",
  );
  const athleteName =
    bookings[0]?.studentName ?? user?.name ?? persisted.demoUser?.name ?? "Athlete";

  if (!ready) {
    return <p className="p-8 text-sm text-[var(--sp-muted)]">Loading…</p>;
  }

  const published = profile?.isProAthlete && profile?.sponsorMeEnabled;
  const stats = computePlayerStats(bookings, profile?.sports ?? []);

  if (!published && !isOwner) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="font-display text-xl font-semibold text-[var(--sp-ink)]">Page not available</p>
        <p className="mt-2 text-sm text-[var(--sp-muted)]">
          This athlete hasn&apos;t published their sponsor page yet.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm font-semibold text-[var(--sp-violet)]">
          ← ShePlays home
        </Link>
      </div>
    );
  }

  const headline =
    profile?.sponsorMeHeadline?.trim() ||
    `Support ${athleteName.split(" ")[0]}'s athletic journey`;
  const story =
    profile?.sponsorMeStory?.trim() ||
    "Training toward the next level — your support helps cover coaching, travel, and competition costs.";

  return (
    <div className="mx-auto grid max-w-2xl gap-8 pb-12 pt-4">
      {isOwner && !published ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
          Preview only — enable &ldquo;Sponsor me&rdquo; in your athlete hub to publish this page.
        </p>
      ) : null}
      <header className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--sp-coral)]">Sponsor me</p>
        <h1 className="font-display mt-2 text-3xl font-bold text-[var(--sp-ink)]">{headline}</h1>
        <p className="mt-2 text-sm text-[var(--sp-muted)]">{athleteName}</p>
        {profile?.sports?.length ? (
          <p className="mt-1 text-sm font-medium text-[var(--sp-teal)]">{profile.sports.join(" · ")}</p>
        ) : null}
      </header>

      <p className="sp-card px-5 py-4 text-sm leading-relaxed text-[var(--sp-muted)]">{story}</p>

      <PlayerStatsCard stats={stats} primarySport={profile?.sports?.[0]} />

      <section className="sp-gradient-hero rounded-2xl p-6 text-center text-white">
        <p className="font-display text-lg font-semibold">Interested in sponsoring?</p>
        <p className="mt-2 text-sm text-white/85">
          Prototype checkout — connect with the athlete&apos;s team to discuss partnership tiers.
        </p>
        <Btn
          variant="secondary"
          type="button"
          className="mt-4 border-white/30 bg-white/20 text-white hover:bg-white/30"
          onClick={() => {
            window.location.href = `mailto:sponsor@sheplays.app?subject=Sponsor%20${encodeURIComponent(athleteName)}`;
          }}
        >
          Contact for sponsorship
        </Btn>
      </section>

      {isOwner ? (
        <Link href="/dashboard/student" className="text-center text-sm font-semibold text-[var(--sp-violet)]">
          ← Back to athlete hub
        </Link>
      ) : (
        <Link href="/" className="text-center text-sm font-semibold text-[var(--sp-violet)]">
          Explore ShePlays
        </Link>
      )}
    </div>
  );
}
