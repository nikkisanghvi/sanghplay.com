"use client";

import Link from "next/link";
import { useMemo } from "react";

import { useShePlays } from "@/providers/sheplays-provider";
import { coachListingIdFromUserKey } from "@/lib/coach-id";

function threadBuckets(user: NonNullable<ReturnType<typeof useShePlays>["user"]>, persisted: ReturnType<typeof useShePlays>["persisted"]) {
  const coachId =
    user.role === "coach" ? coachListingIdFromUserKey(user.key) : null;

  return persisted.threads
    .filter((t) => {
      if (user.role === "student") return t.participantKeys.includes(user.key);
      return t.kind === "session" && t.coachId === coachId;
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export default function MessagesIndexPage() {
  const { user, persisted, ready } = useShePlays();

  const threads = useMemo(() => {
    if (!user) return [];
    return threadBuckets(user, persisted);
  }, [persisted, user]);

  if (!ready)
    return <p className="text-sm text-[var(--sp-muted)]">Hydrating chats…</p>;

  if (!user)
    return (
      <div className="grid gap-4 max-w-md">
        <h1 className="text-2xl font-semibold">Sign in first.</h1>
        <p className="text-sm text-[var(--sp-muted)]">
          Coaches and athletes share one inbox tied to purposeful bookings plus Girls Network mentors.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link className="text-[var(--sp-teal)] underline-offset-4 hover:underline" href="/auth/student/login">
            Athlete login
          </Link>
          <span className="text-[var(--sp-muted)]">or</span>
          <Link className="text-[var(--sp-teal)] underline-offset-4 hover:underline" href="/auth/coach/login">
            Coach login
          </Link>
        </div>
      </div>
    );

  return (
    <div className="grid gap-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--sp-teal)]">Inbox</p>
        <h1 className="mt-2 text-3xl font-semibold">Session & mentor threads</h1>
        <p className="mt-3 text-sm text-[var(--sp-muted)]">
          Session chats appear after guardians finish the placeholder tuition screen. Mentor threads originate from the separate Girls Mentorship lane.
        </p>
      </header>

      <div className="grid gap-3">
        {!threads.length ? (
          <p className="text-sm text-[var(--sp-muted)]">
            Quiet for now · book or message a mentor to spark history.
          </p>
        ) : (
          threads.map((thread) => (
            <Link
              key={thread.id}
              href={`/messages/${thread.id}`}
              className="flex flex-col gap-2 rounded-[1.75rem] border border-black/10 bg-white px-5 py-4 shadow-sm hover:border-black/35"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-[var(--sp-ink)]">{thread.title}</p>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--sp-muted)]">
                  {thread.kind === "session" ? "Coach" : "Mentor"}
                </span>
              </div>
              <p className="line-clamp-2 text-sm text-[var(--sp-muted)]">
                {thread.messages.at(-1)?.body ?? ""}
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
