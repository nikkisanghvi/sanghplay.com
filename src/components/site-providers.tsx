"use client";

import { usePathname } from "next/navigation";

import { BottomNav } from "@/components/bottom-nav";
import { Footer } from "@/components/brand";
import { Navbar } from "@/components/navbar";
import { ShePlaysProvider, useShePlays } from "@/providers/sheplays-provider";

const APP_PREFIXES = [
  "/dashboard",
  "/coaches",
  "/book",
  "/messages",
  "/mentorship",
  "/goals",
  "/news",
  "/settings",
  "/onboarding",
];

function isAppShell(path: string) {
  return APP_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useShePlays();
  const showBottom = user && isAppShell(pathname);
  const hideMarketingNav = pathname === "/welcome" || pathname.startsWith("/auth");

  return (
    <div className="relative z-10 flex min-h-[100svh] flex-col">
      {!hideMarketingNav ? <Navbar /> : null}
      <main
        className={`mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8 ${showBottom ? "sp-safe-bottom" : ""}`}
      >
        {children}
      </main>
      {!showBottom && !hideMarketingNav ? <Footer /> : null}
      {showBottom && user ? <BottomNav role={user.role} /> : null}
    </div>
  );
}

export function SiteProviders({ children }: { children: React.ReactNode }) {
  return (
    <ShePlaysProvider>
      <Shell>{children}</Shell>
    </ShePlaysProvider>
  );
}
