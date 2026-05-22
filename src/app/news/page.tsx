"use client";

import Link from "next/link";

import { PLACEHOLDER_NEWS } from "@/lib/placeholder-data";
import { formatCompactDate } from "@/lib/format";

export default function NewsPage() {
  return (
    <div className="grid gap-8 pb-4">
      <header>
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--sp-teal)]">Community</p>
        <h1 className="font-display text-3xl font-bold">News & events</h1>
      </header>
      <ul className="grid gap-4">
        {PLACEHOLDER_NEWS.map((item) => (
          <li key={item.id} className="sp-card p-5">
            <span className="rounded-full bg-[var(--sp-sand)] px-2 py-0.5 text-[10px] font-semibold uppercase">
              {item.kind}
            </span>
            <h2 className="mt-2 font-display text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm text-[var(--sp-muted)]">{item.excerpt}</p>
            <p className="mt-3 text-xs text-[var(--sp-muted)]">
              {item.sport} · {formatCompactDate(item.publishedAt)}
            </p>
          </li>
        ))}
      </ul>
      <Link href="/coaches" className="text-center text-sm font-semibold text-[var(--sp-violet)]">
        Trending coaches nearby →
      </Link>
    </div>
  );
}
