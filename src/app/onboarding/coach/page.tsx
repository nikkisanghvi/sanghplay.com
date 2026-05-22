"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Btn } from "@/components/button";
import { coachListingIdFromUserKey } from "@/lib/coach-id";
import { useShePlays } from "@/providers/sheplays-provider";
import type { CoachListing, SessionType } from "@/lib/types";

function seededTrust(seed: string) {
  let total = 0;
  for (let i = 0; i < seed.length; i++) total += seed.charCodeAt(i);
  return 87 + (total % 12);
}

export default function CoachOnboardingPage() {
  const router = useRouter();
  const { ready, user, persisted, upsertCoachProfile, completeOnboarding } = useShePlays();

  const coachId = useMemo(() => (user?.key ? coachListingIdFromUserKey(user.key) : ""), [user]);

  useEffect(() => {
    if (!ready || !user) return;
    if (user.role !== "coach") router.replace("/");
    else if (user.onboardingComplete) router.replace("/dashboard/coach");
  }, [ready, router, user]);

  const existing = coachId ? persisted.customCoaches[coachId] : undefined;

  const [sport, setSport] = useState(existing?.sport ?? "Soccer");
  const [location, setLocation] = useState(existing?.location ?? "Your city · TBD venue");
  const [bio, setBio] = useState(
    existing?.bio ??
      "Parents hear clear goals every week, guardians get timelines in advance, athletes learn to lead huddles with respect.",
  );
  const [hourlyRateUsd, setHourlyRateUsd] = useState(String(existing?.hourlyRateUsd ?? 65));
  const [groupRateUsd, setGroupRateUsd] = useState(String(existing?.groupRateUsd ?? 28));
  const [experienceYears, setExperienceYears] = useState(String(existing?.experienceYears ?? 7));
  const [certs, setCerts] = useState(existing?.certifications?.join(", ") ?? "USSF Grassroots, CPR/AED");
  const [primaryLevels, setPrimaryLevels] = useState(existing?.levelTags?.join(", ") ?? "Club, HS JV");
  const [femaleCoach, setFemaleCoach] = useState(existing?.isFemaleCoach ?? true);
  const [privateOk, setPrivateOk] = useState(existing?.sessionTypes.includes("private") ?? true);
  const [groupOk, setGroupOk] = useState(existing?.sessionTypes.includes("group") ?? true);

  if (!ready || !user || user.role !== "coach") {
    return (
      <p className="text-sm text-[var(--sp-muted)]" role="status">
        Routing you securely…
      </p>
    );
  }

  function publishProfile() {
    if (!user) return;

    const sessionTypes: SessionType[] = [];
    if (privateOk) sessionTypes.push("private");
    if (groupOk) sessionTypes.push("group");
    if (!sessionTypes.length) sessionTypes.push("private");

    const hourly = Number.parseFloat(hourlyRateUsd) || 0;
    const profile: CoachListing = {
      id: coachId,
      name: existing?.name ?? user.name,
      avatarUrl:
        existing?.avatarUrl ??
        "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=400&h=400&fit=crop&q=80",
      sport,
      location,
      bio,
      certifications: certs
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      levelTags: primaryLevels
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      sessionTypes,
      isFemaleCoach: femaleCoach,
      trustScore: existing?.trustScore ?? seededTrust(user.email || user.key),
      experienceYears: Number.parseInt(experienceYears, 10) || 1,
      hourlyRateUsd: hourly,
      groupRateUsd:
        Number.parseFloat(groupRateUsd) > 0 ? Number.parseFloat(groupRateUsd) : undefined,
      rating: existing?.rating ?? 4.6,
      reviewCount: existing?.reviewCount ?? 0,
      languages: existing?.languages ?? ["English"],
      isVirtual: existing?.isVirtual ?? false,
      badges: existing?.badges ?? ["responsive"],
      price45: Math.round(hourly * 0.85),
      price60: hourly,
      price90: Math.round(hourly * 1.35),
    };

    upsertCoachProfile(profile);
    completeOnboarding();
    router.push("/dashboard/coach");
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--sp-muted)]">Coach setup</p>
        <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-[var(--sp-ink)]">
          Verified presence starts here.
        </h1>
        <p className="mt-3 text-[var(--sp-muted)]">
          Profiles publish to athlete discovery instantly in this prototype. Layer background checks and
          federation APIs when you integrate production-grade verification.

        </p>
      </div>

      <div className="grid gap-4 rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-[var(--sp-ink)]">Primary sport</span>
            <input
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              className="rounded-2xl border border-black/10 px-4 py-3 outline-none ring-[var(--sp-teal)] focus:ring-2"
              placeholder="Lacrosse, basketball, wrestling…"

            />

          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-[var(--sp-ink)]">Home geography</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="rounded-2xl border border-black/10 px-4 py-3 outline-none ring-[var(--sp-teal)] focus:ring-2"
              placeholder="Brooklyn pods · YMCA partner nights"

            />

          </label>
        </div>

        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-[var(--sp-ink)]">Bio parents skim before booking</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="rounded-3xl border border-black/10 px-4 py-3 outline-none ring-[var(--sp-teal)] focus:ring-2"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-[var(--sp-ink)]">Years coaching</span>
            <input
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              inputMode="numeric"
              className="rounded-2xl border border-black/10 px-4 py-3 outline-none ring-[var(--sp-teal)] focus:ring-2"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-[var(--sp-ink)]">Certifications (comma separated)</span>
            <input
              value={certs}
              onChange={(e) => setCerts(e.target.value)}
              className="rounded-2xl border border-black/10 px-4 py-3 outline-none ring-[var(--sp-teal)] focus:ring-2"
            />
          </label>
        </div>

        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-[var(--sp-ink)]">Athlete readiness tags</span>
          <input
            value={primaryLevels}
            onChange={(e) => setPrimaryLevels(e.target.value)}
            placeholder="Club, JV, varsity prep…"
            className="rounded-2xl border border-black/10 px-4 py-3 outline-none ring-[var(--sp-teal)] focus:ring-2"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-[var(--sp-ink)]">Private hourly (USD)</span>
            <input
              value={hourlyRateUsd}
              onChange={(e) => setHourlyRateUsd(e.target.value)}
              inputMode="decimal"
              className="rounded-2xl border border-black/10 px-4 py-3 outline-none ring-[var(--sp-teal)] focus:ring-2"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-[var(--sp-ink)]">Group athlete rate (USD)</span>
            <input
              value={groupRateUsd}
              onChange={(e) => setGroupRateUsd(e.target.value)}
              inputMode="decimal"
              className="rounded-2xl border border-black/10 px-4 py-3 outline-none ring-[var(--sp-teal)] focus:ring-2"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-6 text-sm font-medium">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={femaleCoach} onChange={() => setFemaleCoach((v) => !v)} />
            Spotlight me under female-coach filtering
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={privateOk} onChange={() => setPrivateOk((v) => !v)} />
            Private pods
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={groupOk} onChange={() => setGroupOk((v) => !v)} />
            Group pods
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Btn variant="primary" onClick={() => publishProfile()}>

          Publish & open Coach HQ

        </Btn>
        <Btn variant="secondary" type="button" onClick={() => router.push("/coaches")}>
          Preview athlete discovery grid
        </Btn>
      </div>

      <p className="text-xs text-[var(--sp-muted)]">
        Coaches can revise profile anytime from {""}

        <Link className="text-[var(--sp-teal)] underline-offset-4 hover:underline" href="/dashboard/coach">

          HQ

        </Link>
        {""}

        .

      </p>
    </div>
  );
}
