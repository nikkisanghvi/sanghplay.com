"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/lib/types";

type NavItem = { href: string; label: string; icon: string };

function studentNav(): NavItem[] {
  return [
    { href: "/dashboard/student", label: "Home", icon: "🏠" },
    { href: "/coaches", label: "Explore", icon: "🔍" },
    { href: "/mentorship", label: "GMN", icon: "💜" },
    { href: "/goals", label: "Goals", icon: "🎯" },
    { href: "/messages", label: "Chat", icon: "💬" },
  ];
}

function parentNav(): NavItem[] {
  return [
    { href: "/dashboard/parent", label: "Home", icon: "🏠" },
    { href: "/coaches", label: "Coaches", icon: "🔍" },
    { href: "/messages", label: "Chat", icon: "💬" },
    { href: "/news", label: "News", icon: "📰" },
    { href: "/settings", label: "Safety", icon: "🛡️" },
  ];
}

function coachNav(): NavItem[] {
  return [
    { href: "/dashboard/coach", label: "HQ", icon: "📋" },
    { href: "/messages", label: "Inbox", icon: "💬" },
    { href: "/settings", label: "Profile", icon: "⚙️" },
  ];
}

function navForRole(role: UserRole): NavItem[] {
  if (role === "parent") return parentNav();
  if (role === "coach" || role === "mentor") return coachNav();
  return studentNav();
}

export function BottomNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items = navForRole(role);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/8 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1">
        {items.map((item) => {
          const active =
            pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-2.5 text-[10px] font-semibold transition ${
                active ? "text-[var(--sp-violet)]" : "text-[var(--sp-muted)]"
              }`}
            >
              <span className="text-lg leading-none" aria-hidden>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
              {active ? (
                <span className="h-0.5 w-5 rounded-full bg-[var(--sp-coral)]" aria-hidden />
              ) : (
                <span className="h-0.5 w-5" aria-hidden />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
