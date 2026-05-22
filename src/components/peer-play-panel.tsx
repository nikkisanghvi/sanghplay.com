"use client";

import { AreaSelect } from "@/components/area-select";
import { Btn } from "@/components/button";
import { formatCompactDate, formatUsd } from "@/lib/format";
import {
  peerPlayProfileDefaults,
  sessionMatchesPeerPlay,
  SKILL_LEVELS,
} from "@/lib/peer-match";
import type { CoachListing, SessionPost, StudentProfile } from "@/lib/types";
import { SPORTS } from "@/lib/constants";

type Props = {
  enabled: boolean;
  onEnabledChange: (v: boolean) => void;
  profile: StudentProfile | null;
  coach?: CoachListing;
  allSessions: SessionPost[];
  allCoaches: CoachListing[];
  onUpdateProfile: (patch: Partial<StudentProfile>) => void;
  onPickSession: (session: SessionPost, coach: CoachListing) => void;
  /** Full-page browse on /coaches — skips the enable checkbox */
  variant?: "panel" | "browse";
};

export function PeerPlayPanel({
  enabled,
  onEnabledChange,
  profile,
  coach,
  allSessions,
  allCoaches,
  onUpdateProfile,
  onPickSession,
  variant = "panel",
}: Props) {
  const prefs = peerPlayProfileDefaults(profile, coach);
  const isBrowse = variant === "browse";
  const active = isBrowse || enabled;

  const matches = active
    ? allSessions
        .map((session) => {
          const sessionCoach = allCoaches.find((c) => c.id === session.coachId);
          if (!sessionMatchesPeerPlay(session, sessionCoach, prefs)) return null;
          return { session, coach: sessionCoach };
        })
        .filter((x): x is { session: SessionPost; coach: CoachListing } => x != null && x.coach != null)
    : [];

  return (
    <section className="rounded-[1.75rem] border border-[var(--sp-teal)]/35 bg-[color-mix(in_oklab,var(--sp-teal)_8%,white)] p-4 sm:p-5">
      {isBrowse ? (
        <div>
          <p className="font-display text-xl font-semibold text-[var(--sp-ink)]">
            Play with athletes at my level
          </p>
          <p className="mt-1 text-sm text-[var(--sp-muted)]">
            Group pods matched by sport, skill level, and your area — Singapore, India, US, and UK.
          </p>
        </div>
      ) : (
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1"
            checked={enabled}
            onChange={() => onEnabledChange(!enabled)}
          />
          <div>
            <p className="font-display font-semibold text-[var(--sp-ink)]">
              Play with athletes at my level
            </p>
            <p className="mt-1 text-sm text-[var(--sp-muted)]">
              Group pods matched by sport, skill level, and your area — train with peers, not alone.
            </p>
          </div>
        </label>
      )}

      {active ? (
        <div className="mt-4 grid gap-4 border-t border-[var(--sp-teal)]/20 pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--sp-muted)]">
            Your match profile
          </p>
          <PeerPrefsFields prefs={prefs} profile={profile} onUpdateProfile={onUpdateProfile} />

          {!matches.length ? (
            <p className="rounded-2xl bg-white/80 px-4 py-3 text-sm text-[var(--sp-muted)]">
              No open group pods yet for {prefs.sports[0]} · {prefs.skillLevel} near {prefs.area}. Try
              widening your level or check back when coaches publish new capsules.
            </p>
          ) : (
            <ul className="grid gap-2">
              {matches.map(({ session, coach: c }) => (
                  <li
                    key={session.id}
                    className="flex flex-col gap-2 rounded-2xl border border-white bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--sp-ink)]">{session.title}</p>
                      <p className="text-xs text-[var(--sp-muted)]">
                        {session.sport} · {session.level} · {session.location}
                      </p>
                      <p className="text-xs text-[var(--sp-muted)]">
                        {formatCompactDate(session.startsAt)} · {c.name}
                        {session.spotsLeft != null ? ` · ${session.spotsLeft} spots left` : ""}
                      </p>
                    </div>
                    <Btn variant="primary" type="button" className="shrink-0" onClick={() => onPickSession(session, c)}>
                      Join pod · {formatUsd(session.priceUsd)}
                    </Btn>
                  </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </section>
  );
}

function PeerPrefsFields({
  prefs,
  profile,
  onUpdateProfile,
}: {
  prefs: ReturnType<typeof peerPlayProfileDefaults>;
  profile: StudentProfile | null;
  onUpdateProfile: (patch: Partial<StudentProfile>) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Sport
        <select
          value={prefs.sports[0] ?? "Cricket"}
          onChange={(e) => onUpdateProfile({ sports: [e.target.value] })}
          className="rounded-xl border border-black/10 px-3 py-2"
        >
          {SPORTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Level
        <select
          value={profile?.skillLevel ?? prefs.skillLevel}
          onChange={(e) => onUpdateProfile({ skillLevel: e.target.value })}
          className="rounded-xl border border-black/10 px-3 py-2"
        >
          {SKILL_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Area
        <AreaSelect
          value={profile?.area ?? prefs.area}
          onChange={(v) => onUpdateProfile({ area: v })}
          className="rounded-xl border border-black/10 px-3 py-2"
        />
      </label>
    </div>
  );
}
