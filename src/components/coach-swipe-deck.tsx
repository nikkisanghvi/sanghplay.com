"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { TrustBadge } from "@/components/trust-badge";
import { formatUsd } from "@/lib/format";
import type { CoachListing } from "@/lib/types";

const SWIPE_THRESHOLD = 72;

type Props = {
  coaches: CoachListing[];
  onEmpty?: () => void;
};

export function CoachSwipeDeck({ coaches, onEmpty }: Props) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);

  const coach = coaches[index];
  const nextCoach = coaches[index + 1];

  useEffect(() => {
    setIndex(0);
    setDragX(0);
  }, [coaches]);

  const advance = useCallback(
    (dir: "left" | "right") => {
      if (!coach) return;
      const id = coach.id;
      setDragX(dir === "left" ? -420 : 420);
      window.setTimeout(() => {
        setIndex((i) => i + 1);
        setDragX(0);
        if (dir === "right") router.push(`/coaches/${id}`);
      }, 180);
    },
    [coach, router],
  );

  const onPointerDown = (clientX: number) => {
    setDragging(true);
    startX.current = clientX;
  };

  const onPointerMove = (clientX: number) => {
    if (!dragging) return;
    setDragX(clientX - startX.current);
  };

  const onPointerEnd = () => {
    if (!dragging) return;
    setDragging(false);
    if (dragX > SWIPE_THRESHOLD) advance("right");
    else if (dragX < -SWIPE_THRESHOLD) advance("left");
    else setDragX(0);
  };

  const rotate = useMemo(() => Math.min(Math.max(dragX / 18, -12), 12), [dragX]);
  const opacity = useMemo(() => 1 - Math.min(Math.abs(dragX) / 320, 0.35), [dragX]);

  if (!coach) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-black/15 bg-white p-8 text-center">
        <p className="font-display text-xl font-semibold text-[var(--sp-ink)]">You&apos;re all caught up</p>
        <p className="mt-2 max-w-sm text-sm text-[var(--sp-muted)]">
          No more coaches match your filters. Loosen filters or check peer pods for group training.
        </p>
        {onEmpty ? (
          <button
            type="button"
            className="mt-6 text-sm font-semibold text-[var(--sp-violet)] underline-offset-4 hover:underline"
            onClick={onEmpty}
          >
            Reset filters
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5">
      <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-[var(--sp-muted)]">
        {index + 1} of {coaches.length} · swipe or tap
      </p>

      <div className="relative mx-auto h-[min(68vh,520px)] w-full max-w-sm touch-pan-y">
        {nextCoach ? (
          <article className="absolute inset-0 scale-[0.96] overflow-hidden rounded-[2rem] border border-black/10 bg-white opacity-60 shadow-inner relative" aria-hidden>
            <Image
              src={nextCoach.avatarUrl}
              alt=""
              fill
              className="rounded-[2rem] object-cover"
              sizes="(max-width: 480px) 100vw"
            />
          </article>
        ) : null}

        <article
          className="absolute inset-0 flex flex-col overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-xl"
          style={{
            transform: `translateX(${dragX}px) rotate(${rotate}deg)`,
            opacity,
            transition: dragging ? "none" : "transform 0.2s ease, opacity 0.2s ease",
          }}
          onPointerDown={(e) => onPointerDown(e.clientX)}
          onPointerMove={(e) => dragging && onPointerMove(e.clientX)}
          onPointerUp={onPointerEnd}
          onPointerLeave={() => dragging && onPointerEnd()}
          onPointerCancel={onPointerEnd}
        >
          <div className="relative h-[58%] min-h-[220px] w-full shrink-0">
            <Image src={coach.avatarUrl} alt="" fill className="object-cover" sizes="480px" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <p className="font-display text-2xl font-bold">{coach.name}</p>
              <p className="text-sm text-white/90">
                {coach.sport} · {coach.isVirtual ? "Virtual" : coach.location}
              </p>
              <p className="mt-1 text-xs text-white/80">
                ⭐ {coach.rating.toFixed(1)} · {coach.experienceYears}+ yrs
              </p>
            </div>
            {dragX > 40 ? (
              <span className="absolute left-4 top-4 rounded-full border-2 border-emerald-400 bg-emerald-500/90 px-3 py-1 text-xs font-bold uppercase text-white">
                Interested
              </span>
            ) : null}
            {dragX < -40 ? (
              <span className="absolute right-4 top-4 rounded-full border-2 border-rose-300 bg-rose-500/90 px-3 py-1 text-xs font-bold uppercase text-white">
                Skip
              </span>
            ) : null}
          </div>

          <div className="flex flex-1 flex-col gap-3 p-5">
            <TrustBadge coach={coach} />
            <p className="line-clamp-3 text-sm leading-relaxed text-[var(--sp-muted)]">{coach.bio}</p>
            <div className="mt-auto flex flex-wrap gap-2">
              {coach.levelTags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full bg-[var(--sp-sand)] px-2 py-0.5 text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-sm font-semibold text-[var(--sp-ink)]">
              {formatUsd(coach.price60 ?? coach.hourlyRateUsd)}
              <span className="font-normal text-[var(--sp-muted)]"> / session</span>
            </p>
          </div>
        </article>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          aria-label="Skip coach"
          className="grid h-14 w-14 place-items-center rounded-full border-2 border-rose-200 bg-white text-2xl shadow-sm transition hover:bg-rose-50"
          onClick={() => advance("left")}
        >
          ✕
        </button>
        <Link
          href={`/coaches/${coach.id}`}
          className="grid h-16 w-16 place-items-center rounded-full bg-[var(--sp-violet)] text-2xl text-white shadow-lg transition hover:scale-105"
          aria-label="View profile"
        >
          ♥
        </Link>
        <Link
          href={`/book/${coach.id}`}
          className="grid h-14 w-14 place-items-center rounded-full border-2 border-[var(--sp-teal)] bg-[var(--sp-teal)]/10 text-xl font-bold text-[var(--sp-teal)] shadow-sm"
          aria-label="Book classes"
        >
          📅
        </Link>
      </div>
    </div>
  );
}
