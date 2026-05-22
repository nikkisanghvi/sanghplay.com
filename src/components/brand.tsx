import Link from "next/link";

export function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2 font-semibold tracking-tight text-[var(--sp-ink)]">
      <span
        aria-hidden
        className={`grid shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[var(--sp-violet)] to-[var(--sp-coral)] text-white shadow-sm ${compact ? "h-8 w-8 text-xs" : "h-9 w-9 text-sm"}`}
      >
        SP
      </span>
      {!compact ? <span className="text-[1.08rem] sm:text-xl">ShePlays</span> : null}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[color-mix(in_oklab,var(--sp-ink)_8%,transparent)] bg-[color-mix(in_oklab,var(--sp-sand)_60%,white)] px-4 py-8 text-sm text-[var(--sp-muted)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <LogoMark compact />
        <p className="max-w-xl leading-relaxed">
          ShePlays is a prototype. Background checks and payment processing will connect here when your
          program goes live — today we focus on the journey parents and athletes should feel while
          booking trusted coaching.
        </p>
      </div>
    </footer>
  );
}

export function FooterLinkRow() {
  return (
    <div className="mt-10 flex flex-wrap gap-4 text-sm">
      <Link className="text-[var(--sp-teal)] underline-offset-4 hover:underline" href="/coaches">
        Find Coaches
      </Link>
      <Link className="text-[var(--sp-teal)] underline-offset-4 hover:underline" href="/mentorship">
        Girls Mentorship Network
      </Link>
      <Link className="text-[var(--sp-teal)] underline-offset-4 hover:underline" href="/auth/student/signup">
        Athlete signup
      </Link>
      <Link className="text-[var(--sp-teal)] underline-offset-4 hover:underline" href="/auth/coach/signup">
        Coach signup
      </Link>
    </div>
  );
}
