"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogoMark } from "@/components/brand";
import { useShePlays } from "@/providers/sheplays-provider";

const baseLink =
  "rounded-full px-3 py-1.5 text-sm font-medium text-[var(--sp-muted)] transition hover:bg-black/5 hover:text-[var(--sp-ink)]";

function ActiveLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      className={`${baseLink} ${active ? "bg-black/6 text-[var(--sp-ink)]" : ""}`}
    >
      {children}
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { ready, user, signOut, supabaseMode } = useShePlays();
  const [open, setOpen] = useState(false);

  const dashboardHref =
    user?.role === "coach" ? "/dashboard/coach" : "/dashboard/student";

  return (
    <header className="sticky top-0 z-40 border-b border-[color-mix(in_oklab,var(--sp-ink)_8%,transparent)] bg-[color-mix(in_oklab,white_92%,var(--sp-sand))]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
        <Link
          href="/"
          className="-ml-1 flex items-center rounded-full px-2 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--sp-teal)]"
        >
          <LogoMark />
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          <ActiveLink href="/coaches">Coaches</ActiveLink>
          <ActiveLink href="/mentorship">Mentorship</ActiveLink>

          {!ready ? null : user?.role === "student" ? (
            <>
              <ActiveLink href="/dashboard/student">Athlete Hub</ActiveLink>
              <ActiveLink href="/messages">Messages</ActiveLink>
            </>
          ) : user?.role === "coach" ? (
            <>
              <ActiveLink href="/dashboard/coach">Coach HQ</ActiveLink>
              <ActiveLink href="/messages">Messages</ActiveLink>
            </>
          ) : (
            <>
              <ActiveLink href="/auth/student/login">Athlete Login</ActiveLink>
              <ActiveLink href="/auth/coach/login">Coach Login</ActiveLink>
              <Link
                href="/auth/student/signup"
                className="ml-2 inline-flex items-center rounded-full bg-[var(--sp-coral)] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[color-mix(in_oklab,var(--sp-coral)_88%,black)]"
              >
                Join free
              </Link>
            </>
          )}

          {user ? (
            <button
              type="button"
              className={`ml-2 cursor-pointer px-3 text-sm ${baseLink}`}
              onClick={() => void signOut()}
            >
              Sign out
            </button>
          ) : null}
        </nav>

        {supabaseMode ? (
          <span className="hidden text-[11px] text-[var(--sp-muted)] md:inline">
            Supabase enabled
          </span>
        ) : (
          <span className="hidden text-[11px] text-[var(--sp-muted)] md:inline">
            Demo mode · local-first
          </span>
        )}

        <button
          type="button"
          aria-expanded={open}
          className="ml-auto grid h-10 w-10 place-items-center rounded-full border border-black/10 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Toggle menu</span>
          <div className="flex flex-col gap-1">
            <span className="h-[2px] w-5 rounded-full bg-black" />
            <span className="h-[2px] w-5 rounded-full bg-black" />
          </div>
        </button>
      </div>

      {open ? (
        <div className="border-t border-black/10 bg-white px-4 pb-6 pt-4 md:hidden">
          <nav className="flex flex-col gap-1">
            <Link className={`${pathname === "/" ? "bg-black/5" : ""} ${baseLink}`} href="/">
              Home
            </Link>
            <ActiveLink href="/coaches">Coaches</ActiveLink>
            <ActiveLink href="/mentorship">Mentorship</ActiveLink>

            {!ready ? null : user ? (
              <>
                <ActiveLink href={dashboardHref}>
                  {user.role === "coach" ? "Coach HQ" : "Athlete Hub"}
                </ActiveLink>
                <ActiveLink href="/messages">Messages</ActiveLink>
                <button
                  type="button"
                  className={`text-left ${baseLink}`}
                  onClick={() => void signOut()}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <ActiveLink href="/auth/student/login">Athlete Login</ActiveLink>
                <ActiveLink href="/auth/coach/login">Coach Login</ActiveLink>
                <ActiveLink href="/auth/student/signup">Athlete signup</ActiveLink>
                <ActiveLink href="/auth/coach/signup">Coach signup</ActiveLink>
              </>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
