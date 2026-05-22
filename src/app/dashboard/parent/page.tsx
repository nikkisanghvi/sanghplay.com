"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Btn } from "@/components/button";
import { formatCompactDate } from "@/lib/format";
import { useShePlays } from "@/providers/sheplays-provider";

export default function ParentDashboardPage() {
  const router = useRouter();
  const { ready, user, persisted } = useShePlays();
  const childName = user?.role === "parent" ? (persisted.demoUser?.childName ?? "Your athlete") : "";

  useEffect(() => {
    if (!ready || !user) router.replace("/welcome");
    else if (user.role !== "parent") router.replace("/");
  }, [ready, router, user]);

  if (!ready || !user || user.role !== "parent") {
    return <p className="text-sm text-[var(--sp-muted)]">Loading…</p>;
  }

  const sessions = persisted.bookings.filter((b) => b.status === "confirmed");

  return (
    <div className="grid gap-8 pb-4">
      <header>
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--sp-teal)]">Parent dashboard</p>
        <h1 className="font-display text-3xl font-bold">Hi {user.name.split(" ")[0]}</h1>
        <p className="text-sm text-[var(--sp-muted)]">Managing sessions for {childName}</p>
      </header>

      <section className="sp-card p-5">
        <h2 className="font-display text-lg font-semibold">Upcoming sessions</h2>
        {!sessions.length ? (
          <p className="mt-3 text-sm text-[var(--sp-muted)]">No confirmed sessions yet.</p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {sessions.map((b) => (
              <li key={b.id} className="rounded-2xl bg-[var(--sp-sand)] px-4 py-3 text-sm">
                <p className="font-semibold">
                  {b.sport} with {b.coachName}
                </p>
                <p className="text-[var(--sp-muted)]">{formatCompactDate(b.startsAt)}</p>
              </li>
            ))}
          </ul>
        )}
        <Btn variant="primary" type="button" className="mt-4 w-full" onClick={() => router.push("/coaches")}>
          Book a coach for {childName.split(" ")[0]}
        </Btn>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link href="/messages" className="sp-card p-4 hover:shadow-md">
          <p className="font-semibold">Parent-coach chat</p>
          <p className="mt-1 text-sm text-[var(--sp-muted)]">Structured prompts · monitor under-13 messages</p>
        </Link>
        <Link href="/settings" className="sp-card p-4 hover:shadow-md">
          <p className="font-semibold">Safety controls</p>
          <p className="mt-1 text-sm text-[var(--sp-muted)]">Approve coaches, block, report</p>
        </Link>
      </section>
    </div>
  );
}
