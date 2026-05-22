"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Btn } from "@/components/button";
import type { StudentProfile } from "@/lib/types";

type Props = {
  athleteName: string;
  studentKey: string;
  profile: StudentProfile | null;
  onUpdateProfile: (patch: Partial<StudentProfile>) => void;
};

export function SponsorMeCard({ athleteName, studentKey, profile, onUpdateProfile }: Props) {
  const [copied, setCopied] = useState(false);
  const isPro = profile?.isProAthlete ?? false;
  const enabled = profile?.sponsorMeEnabled ?? false;

  const sponsorUrl = useMemo(() => {
    if (typeof window === "undefined") return `/sponsor/${encodeURIComponent(studentKey)}`;
    return `${window.location.origin}/sponsor/${encodeURIComponent(studentKey)}`;
  }, [studentKey]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(sponsorUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="rounded-[1.75rem] border border-[var(--sp-coral)]/30 bg-[color-mix(in_oklab,var(--sp-coral)_10%,white)] p-5">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          className="mt-1"
          checked={isPro}
          onChange={() => onUpdateProfile({ isProAthlete: !isPro, sponsorMeEnabled: !isPro ? true : false })}
        />
        <div>
          <p className="font-display font-semibold text-[var(--sp-ink)]">I&apos;m a pro / elite athlete</p>
          <p className="mt-1 text-sm text-[var(--sp-muted)]">
            Unlock a public &ldquo;Sponsor me&rdquo; page for brands, clubs, and supporters.
          </p>
        </div>
      </label>

      {isPro ? (
        <div className="mt-4 grid gap-4 border-t border-[var(--sp-coral)]/20 pt-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={enabled}
              onChange={() => onUpdateProfile({ sponsorMeEnabled: !enabled })}
            />
            Show &ldquo;Sponsor me&rdquo; on my public page
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Headline
            <input
              value={profile?.sponsorMeHeadline ?? ""}
              onChange={(e) => onUpdateProfile({ sponsorMeHeadline: e.target.value })}
              placeholder={`Support ${athleteName.split(" ")[0]}'s journey`}
              className="rounded-xl border border-black/10 px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Your story (for sponsors)
            <textarea
              value={profile?.sponsorMeStory ?? ""}
              onChange={(e) => onUpdateProfile({ sponsorMeStory: e.target.value })}
              placeholder="Share your goals, recent wins, and how sponsorship helps training, travel, and equipment…"
              rows={3}
              className="resize-none rounded-xl border border-black/10 px-3 py-2"
            />
          </label>

          {enabled ? (
            <div className="flex flex-wrap gap-2">
              <Btn variant="primary" type="button" onClick={copyLink}>
                {copied ? "Link copied!" : "Copy sponsor link"}
              </Btn>
              <Link
                href={`/sponsor/${encodeURIComponent(studentKey)}`}
                className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-[var(--sp-ink)]"
                target="_blank"
                rel="noopener noreferrer"
              >
                Preview page
              </Link>
            </div>
          ) : (
            <p className="text-sm text-[var(--sp-muted)]">
              Turn on the toggle above to publish your sponsor page.
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}
