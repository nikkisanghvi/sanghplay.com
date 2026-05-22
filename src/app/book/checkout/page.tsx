"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Btn } from "@/components/button";
import { formatCompactDate, formatUsd } from "@/lib/format";
import { useShePlays } from "@/providers/sheplays-provider";

function CheckoutInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { persisted, confirmBookingPayment, user, ready } = useShePlays();
  const bookingId = searchParams.get("bookingId");

  const booking = useMemo(
    () => persisted.bookings.find((b) => b.id === bookingId) ?? null,
    [bookingId, persisted.bookings],
  );

  if (!ready) return <p className="text-sm text-[var(--sp-muted)]">Preparing ledger…</p>;

  if (!user || user.role !== "student") {
    router.replace("/auth/student/login");
    return null;
  }

  if (!booking || booking.studentKey !== user.key) {
    return (
      <div className="grid gap-4">
        <h1 className="text-2xl font-semibold">Booking not attached to this athlete.</h1>
        <Btn variant="secondary" type="button" onClick={() => router.push("/coaches")}>
          Browse coaches again
        </Btn>
      </div>
    );
  }

  if (booking.status === "confirmed") {
    router.replace(`/book/confirm?bookingId=${booking.id}`);
    return null;
  }

  function pay() {
    if (!booking) return;
    confirmBookingPayment(booking.id);
    router.push(`/book/confirm?bookingId=${booking.id}`);
  }

  return (
    <div className="mx-auto grid max-w-lg gap-6 rounded-[2rem] border border-black/10 bg-white p-6 shadow-xl sm:p-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--sp-muted)]">Placeholder checkout</p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--sp-ink)]">Finalize session tuition</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--sp-muted)]">
          Swap this screen for Stripe Checkout, Apple Pay later, campus billing codes, scholarships, or whatever ops
          your club layer needs · we keep wording calm for hovering parents right now.

        </p>

      </div>

      <div className="rounded-3xl bg-[var(--sp-sand)] px-5 py-4 text-sm leading-relaxed text-[var(--sp-ink)]">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--sp-muted)]">Summary</p>
        <dl className="mt-4 space-y-2">
          <div className="flex justify-between gap-4">
            <dt>{booking.coachName}</dt>

            <dd className="font-semibold">{formatUsd(booking.amountUsd)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>{booking.sessionType === "private" ? "Private" : "Group"} · {booking.sport}</dt>

            <dd className="text-[var(--sp-muted)]">{formatCompactDate(booking.startsAt)}</dd>

          </div>
        </dl>
      </div>

      <div className="rounded-3xl border border-dashed border-[var(--sp-teal)]/40 px-5 py-4 text-xs text-[var(--sp-muted)]">
        <p>
          Charges appear as SHEPLAYS PROTOTYPE HOLD · guardians receive SMS copy + Face ID reassurance when mobile wrappers
          attach.

        </p>

      </div>

      <Btn variant="primary" type="button" className="w-full justify-center" onClick={() => pay()}>
        Pay {formatUsd(booking.amountUsd)} securely (simulated)

      </Btn>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto grid max-w-md gap-2 rounded-3xl border border-black/10 bg-white p-6 text-sm">
          Hydrating ledger…

        </div>
      }

    >
      <CheckoutInner />
    </Suspense>
  );
}
