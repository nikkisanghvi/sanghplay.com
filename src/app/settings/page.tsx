"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { AreaSelect } from "@/components/area-select";
import { Btn } from "@/components/button";
import { SPORTS } from "@/lib/constants";
import { SKILL_LEVELS } from "@/lib/peer-match";
import { useShePlays } from "@/providers/sheplays-provider";

export default function SettingsPage() {
  const router = useRouter();
  const { ready, user, signOut, persisted, updateStudentProfile } = useShePlays();
  const profile = persisted.studentProfile;

  useEffect(() => {
    if (!ready || !user) router.replace("/welcome");
  }, [ready, router, user]);

  if (!ready || !user) return null;

  return (
    <div className="grid gap-8 pb-4">
      <header>
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--sp-teal)]">Settings</p>
        <h1 className="font-display text-3xl font-bold">Profile & safety</h1>
      </header>

      <section className="sp-card p-5">
        <p className="text-sm text-[var(--sp-muted)]">Signed in as</p>
        <p className="font-display text-xl font-semibold">{user.name}</p>
        <p className="text-sm text-[var(--sp-muted)]">{user.email}</p>
        <p className="mt-2 text-xs capitalize text-[var(--sp-violet)]">{user.role}</p>
      </section>

      {user.role === "student" ? (
        <section className="sp-card grid gap-4 p-5">
          <h2 className="font-semibold">Peer play matching</h2>
          <p className="text-sm text-[var(--sp-muted)]">
            Used to find group pods with athletes at your level, in your sport, near you.
          </p>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Primary sport
            <select
              value={profile?.sports?.[0] ?? "Cricket"}
              onChange={(e) => updateStudentProfile({ sports: [e.target.value] })}
              className="rounded-2xl border px-3 py-2.5"
            >
              {SPORTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Skill level
            <select
              value={profile?.skillLevel ?? "Club"}
              onChange={(e) => updateStudentProfile({ skillLevel: e.target.value })}
              className="rounded-2xl border px-3 py-2.5"
            >
              {SKILL_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Home area
            <AreaSelect
              value={profile?.area ?? "Singapore"}
              onChange={(v) => updateStudentProfile({ area: v })}
              className="rounded-2xl border px-3 py-2.5"
            />
          </label>
        </section>
      ) : null}

      <section className="sp-card space-y-3 p-5">
        <h2 className="font-semibold">Safety</h2>
        <p className="text-sm text-[var(--sp-muted)]">
          Flag, block, or report any user. Chat unlocks only after booking.
        </p>
        <Btn variant="secondary" type="button" className="w-full">
          Report a concern
        </Btn>
      </section>

      <Btn
        variant="primary"
        type="button"
        className="w-full"
        onClick={() => void signOut().then(() => router.push("/welcome"))}
      >
        Sign out
      </Btn>
    </div>
  );
}
