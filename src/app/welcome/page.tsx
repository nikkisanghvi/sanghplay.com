"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { LogoMark } from "@/components/brand";
import { useShePlays } from "@/providers/sheplays-provider";
import type { UserRole } from "@/lib/types";

const ROLES: { role: UserRole; title: string; desc: string; href: string; emoji: string }[] = [
  {
    role: "student",
    title: "Student Athlete",
    desc: "Ages 8–18 · train, track goals, earn badges",
    href: "/auth/student/signup",
    emoji: "⚡",
  },
  {
    role: "parent",
    title: "Parent / Guardian",
    desc: "Book coaches, monitor chat, approve matches",
    href: "/auth/parent/signup",
    emoji: "🛡️",
  },
  {
    role: "coach",
    title: "Coach",
    desc: "Verified, background-checked · grow your roster",
    href: "/auth/coach/signup",
    emoji: "🏅",
  },
  {
    role: "mentor",
    title: "Mentor",
    desc: "Former athletes · inspire without commercial sessions",
    href: "/auth/mentor/signup",
    emoji: "💜",
  },
];

export default function WelcomePage() {
  const router = useRouter();
  const { ready, user } = useShePlays();

  useEffect(() => {
    if (!ready || !user) return;
    const map: Record<UserRole, string> = {
      student: user.onboardingComplete ? "/dashboard/student" : "/onboarding/student",
      parent: "/dashboard/parent",
      coach: user.onboardingComplete ? "/dashboard/coach" : "/onboarding/coach",
      mentor: "/mentorship",
    };
    router.replace(map[user.role]);
  }, [ready, router, user]);

  return (
    <div className="mx-auto flex min-h-[85svh] max-w-lg flex-col items-center justify-center gap-10 py-8">
      <div className="sp-gradient-hero w-full rounded-[2rem] px-8 py-12 text-center text-white shadow-xl">
        <LogoMark />
        <p className="mt-6 font-display text-sm uppercase tracking-[0.35em] text-white/80">Stay in the game.</p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">ShePlays</h1>
        <p className="mt-4 text-sm leading-relaxed text-white/85">
          Coaching and mentorship built for girls in sport — safe, empowering, parent-trusted.
        </p>
      </div>

      <div className="w-full space-y-3">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-[var(--sp-muted)]">
          I am a…
        </p>
        {ROLES.map((r) => (
          <Link
            key={r.role}
            href={r.href}
            className="sp-card flex items-center gap-4 p-4 transition hover:border-[var(--sp-violet)]/30 hover:shadow-md"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--sp-sand)] text-2xl">{r.emoji}</span>
            <div className="min-w-0 flex-1 text-left">
              <p className="font-display font-semibold text-[var(--sp-ink)]">{r.title}</p>
              <p className="text-sm text-[var(--sp-muted)]">{r.desc}</p>
            </div>
            <span className="text-[var(--sp-muted)]">→</span>
          </Link>
        ))}
      </div>

      <p className="text-center text-sm text-[var(--sp-muted)]">
        Already have an account?{" "}
        <Link href="/auth/student/login" className="font-semibold text-[var(--sp-violet)] underline-offset-2 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
