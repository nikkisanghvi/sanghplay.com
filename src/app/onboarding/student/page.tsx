"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Btn } from "@/components/button";
import { useShePlays } from "@/providers/sheplays-provider";

export default function StudentOnboardingPage() {
  const router = useRouter();
  const { ready, user, completeOnboarding } = useShePlays();

  useEffect(() => {
    if (!ready || !user) return;
    if (user.role !== "student") router.replace("/");
    else if (user.onboardingComplete) router.replace("/dashboard/student");
  }, [ready, router, user]);

  if (!ready || !user || user.role !== "student") {
    return (
      <p className="text-sm text-[var(--sp-muted)]" role="status">
        Routing you securely…
      </p>
    );
  }

  return (
    <div className="mx-auto grid max-w-2xl gap-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--sp-muted)]">Athlete playbook</p>
        <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-[var(--sp-ink)]">
          Confidence looks like intentional reps.
        </h1>
        <p className="mt-3 text-[var(--sp-muted)]">
          ShePlays keeps chat tied to bookings so guardians always know conversations are purposeful, not noisy.
          You can explore coaches freely, bookmark favorites, then request sessions transparently.

        </p>
      </div>

      <ol className="list-decimal space-y-6 pl-5 text-sm leading-relaxed text-[var(--sp-muted)]">
        <li>
          Browse coaches with clarity on sport alignment, certifications, pricing, and a visible Trust Score
          caregivers can sanity-check instantly.

        </li>
        <li>
          Use the calendar picker to visualize availability the way coaches publish it — no mystery “DM for
          times” workflows.

        </li>
        <li>
          After payment is confirmed on the prototype checkout, messaging unlocks for logistics only — mentors
          in the Girls Network live on their own uplifting lane.

        </li>
      </ol>

      <div className="flex flex-wrap gap-3">
        <Btn
          variant="primary"
          onClick={() => {
            completeOnboarding();
            router.push("/dashboard/student");
          }}
        >
          Enter Athlete Hub
        </Btn>
        <Btn variant="secondary" type="button" onClick={() => router.push("/coaches")}>
          Preview coach discovery first
        </Btn>
      </div>

      <p className="text-xs text-[var(--sp-muted)]">
        Need to revisit later? {""}

        <Link className="text-[var(--sp-teal)] underline-offset-4 hover:underline" href="/">
          Jump home
        </Link>
      </p>
    </div>
  );
}
