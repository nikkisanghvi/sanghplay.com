"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { BtnLink } from "@/components/button";
import { formatCompactDate, formatUsd } from "@/lib/format";
import { useShePlays } from "@/providers/sheplays-provider";

function ConfirmInner() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const { persisted, user, ready } = useShePlays();

  const booking = useMemo(
    () => persisted.bookings.find((b) => b.id === bookingId) ?? null,
    [bookingId, persisted.bookings],
  );

  if (!ready) return <p className="text-sm text-[var(--sp-muted)]">Confirming itinerary…</p>;

  if (!user || user.role !== "student" || !booking || booking.studentKey !== user.key || booking.status !== "confirmed") {
    return (
      <div className="grid gap-4">
        <h1 className="text-2xl font-semibold">No confirmed booking surfaced.</h1>
        <BtnLink variant="secondary" href="/dashboard/student" className="min-h-11">
          Jump to athlete hub

        </BtnLink>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-xl gap-6 rounded-[2.5rem] border border-black/10 bg-gradient-to-br from-white via-[var(--sp-blush)] to-[var(--sp-sand)] p-8 text-center shadow-xl">
      <p className="text-xs uppercase tracking-[0.35em] text-[var(--sp-teal)]">You&apos;re booked</p>
      <h1 className="text-balance text-3xl font-semibold text-[var(--sp-ink)]">
        {booking.sport} with {booking.coachName}

      </h1>
      <p className="text-sm text-[var(--sp-muted)]">
        Receipt + calendar invite scaffolding drop into production email later · for now guardians can screenshot this serenity.

      </p>
      <div className="rounded-3xl border border-white/70 bg-white/90 px-5 py-4 text-sm text-[var(--sp-ink)] shadow-inner">
        <p className="font-semibold">{formatCompactDate(booking.startsAt)}</p>

        <p className="text-[var(--sp-muted)]">Tuition acknowledged at {formatUsd(booking.amountUsd)} · placeholder processor</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <BtnLink href="/messages">Open inbox</BtnLink>

        <BtnLink href="/dashboard/student" variant="secondary">
          Athlete Hub
        </BtnLink>
      </div>
      <Link className="text-xs text-[var(--sp-teal)] underline-offset-4 hover:underline" href="/coaches">
        Keep exploring mentors

      </Link>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[var(--sp-muted)]">Preparing applause…</p>}>
      <ConfirmInner />

    </Suspense>
  );
}
