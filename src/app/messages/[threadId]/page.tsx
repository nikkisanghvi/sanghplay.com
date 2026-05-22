"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { Btn } from "@/components/button";
import { formatCompactDate } from "@/lib/format";
import { coachListingIdFromUserKey } from "@/lib/coach-id";
import { useShePlays } from "@/providers/sheplays-provider";
export default function MessageThreadPage() {
  const params = useParams<{ threadId: string }>();
  const router = useRouter();
  const { user, persisted, ready, addChatMessage } = useShePlays();
  const [body, setBody] = useState("");
  const coachListingId =
    user?.role === "coach" ? coachListingIdFromUserKey(user.key) : "";
  const thread = useMemo(
    () => persisted.threads.find((t) => t.id === params.threadId),
    [params.threadId, persisted.threads],
  );
  const allowed = useMemo(() => {
    if (!thread || !user) return false;
    if (user.role === "student") {
      return thread.participantKeys.includes(user.key);
    }
    return (
      thread.kind === "session" &&
      !!thread.coachId &&
      thread.coachId === coachListingId
    );
  }, [coachListingId, thread, user]);
  const sorted =
    thread?.messages.slice().sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    ) ?? [];
  if (!ready) return <p className="text-sm text-[var(--sp-muted)]">Cracking inbox…</p>;
  if (!user) {
    router.replace("/");
    return null;
  }
  if (!thread || !allowed) {
    return (
      <div className="mx-auto grid max-w-xl gap-4">
        <h1 className="text-xl font-semibold">Thread unavailable.</h1>
        <Link className="text-[var(--sp-teal)] underline-offset-4 hover:underline" href="/messages">
          Back to inbox
        </Link>
      </div>
    );
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!body.trim() || !thread) return;
    addChatMessage(thread.id, body.trim());
    setBody("");
  }
  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <header className="rounded-[2rem] border border-black/10 bg-white px-5 py-4 shadow-inner">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--sp-muted)]">
          {thread.kind === "session" ? "Session logistics" : "Mentorship dialogue"}
        </p>
        <h1 className="text-3xl font-semibold">{thread.title}</h1>
        <button
          type="button"
          className="mt-4 text-xs text-[var(--sp-teal)] underline-offset-4 hover:underline"
          onClick={() => router.push("/messages")}
        >
          ← Back
        </button>
      </header>
      <div className="grid gap-3 rounded-[2rem] border border-black/10 bg-white p-5">
        {sorted.map((msg) => {
          const speaker =
            msg.authorKey === "__system"
              ? "ShePlays concierge"
              : (thread.participantNames[msg.authorKey] ?? msg.authorKey);
          return (
            <article key={msg.id} className="rounded-2xl bg-[var(--sp-sand)] px-4 py-3">
              <div className="flex items-center justify-between gap-4 text-[11px] uppercase tracking-[0.2em] text-[var(--sp-muted)]">
                <span className="font-semibold">{speaker}</span>
                <time dateTime={msg.createdAt}>{formatCompactDate(msg.createdAt)}</time>
              </div>
              <p className="mt-3 text-sm text-[var(--sp-ink)]">{msg.body}</p>
            </article>
          );
        })}
      </div>
      <form
        className="grid gap-3 rounded-[2rem] border border-black/15 bg-[var(--sp-surface)] p-5"
        onSubmit={submit}
      >
        <label className="text-sm font-semibold text-[var(--sp-ink)]">
          Compose
          <textarea
            rows={4}
            value={body}
            placeholder="Parking, warmup, mentorship gratitude…"
            className="mt-2 w-full rounded-3xl border border-black/10 px-4 py-3 text-sm outline-none ring-[var(--sp-teal)] focus:ring-2"
            onChange={(e) => setBody(e.target.value)}
          />
        </label>
        <Btn type="submit" variant="primary" className="w-full justify-center sm:w-auto">
          Send
        </Btn>
      </form>
    </div>
  );
}
