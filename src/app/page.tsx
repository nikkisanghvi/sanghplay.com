import Link from "next/link";

import { BtnLink } from "@/components/button";

export default function HomePage() {
  return (
    <div className="mx-auto grid max-w-5xl gap-12 pb-20">
      <section className="relative overflow-hidden rounded-[2rem] sp-gradient-hero px-6 py-14 text-white shadow-xl sm:px-12">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/75">Stay in the game.</p>
        <h1 className="font-display mt-4 text-balance text-4xl font-bold sm:text-5xl">
          ShePlays keeps girls in sport.
        </h1>
        <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-white/90">
          Verified coaches, safe messaging, parent dashboards, and the Girls Mentorship Network — built mobile-first
          for athletes ages 8–18.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <BtnLink href="/welcome" variant="secondary" className="min-h-12 border-white/40 bg-white text-[var(--sp-violet)]">
            Get started
          </BtnLink>
          <BtnLink href="/coaches" variant="ghost" className="min-h-12 border border-white/40 text-white">
            Browse coaches
          </BtnLink>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        {[
          {
            title: "Trust Score on every coach",
            copy: "Background checks, parent ratings, and session history — transparent before you book.",
          },
          {
            title: "Safety by design",
            copy: "Coaches can't browse students. Chat unlocks after booking. Parent visibility for under-13.",
          },
          {
            title: "Girls Mentorship Network",
            copy: "Stories, mentors, learning paths, and Ask-a-Mentor — separate from paid coaching.",
          },
        ].map((f) => (
          <article key={f.title} className="sp-card p-6">
            <h2 className="font-display text-lg font-semibold">{f.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--sp-muted)]">{f.copy}</p>
          </article>
        ))}
      </section>

      <section className="sp-card-dark rounded-[2rem] px-6 py-10 text-center sm:px-12">
        <h2 className="font-display text-2xl font-bold">Ready to train with purpose?</h2>
        <Link
          href="/welcome"
          className="mt-6 inline-flex rounded-full bg-[var(--sp-coral)] px-8 py-3 text-sm font-semibold text-white"
        >
          Choose your role
        </Link>
      </section>
    </div>
  );
}
