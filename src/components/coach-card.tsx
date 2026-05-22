import Image from "next/image";
import Link from "next/link";

import { TrustBadge } from "@/components/trust-badge";
import { formatUsd } from "@/lib/format";
import type { CoachListing } from "@/lib/types";

export function CoachCard({ coach }: { coach: CoachListing }) {
  const price = coach.price60 ?? coach.hourlyRateUsd;

  return (
    <article className="sp-card flex flex-col gap-3 p-4 transition hover:shadow-lg">
      <div className="flex items-start gap-3">
        <Image
          src={coach.avatarUrl}
          alt=""
          width={72}
          height={72}
          className="h-16 w-16 shrink-0 rounded-2xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-lg font-semibold text-[var(--sp-ink)]">{coach.name}</h2>
          <p className="text-sm text-[var(--sp-muted)]">
            {coach.sport} · {coach.isVirtual ? "Virtual" : coach.location}
          </p>
          <p className="mt-1 text-xs text-[var(--sp-muted)]">
            ⭐ {coach.rating.toFixed(1)} ({coach.reviewCount} reviews)
          </p>
          <div className="mt-2">
            <TrustBadge coach={coach} />
          </div>
        </div>
      </div>
      <p className="line-clamp-2 text-sm text-[var(--sp-muted)]">{coach.bio}</p>
      <div className="mt-auto flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-[var(--sp-ink)]">
          {formatUsd(price)}
          <span className="font-normal text-[var(--sp-muted)]"> / session</span>
        </p>
        <Link
          href={`/coaches/${coach.id}`}
          className="rounded-full bg-[var(--sp-violet)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--sp-violet-deep)]"
        >
          Book
        </Link>
      </div>
    </article>
  );
}
