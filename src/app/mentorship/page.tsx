"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Btn, BtnLink } from "@/components/button";
import { LEARNING_PATHS } from "@/lib/constants";
import {
  PLACEHOLDER_MENTOR_VIDEOS,
  PLACEHOLDER_MENTORS,
} from "@/lib/placeholder-data";
import { useShePlays } from "@/providers/sheplays-provider";
export default function MentorshipPage() {
  const router = useRouter();
  const { user, ensureMentorThread, ready } = useShePlays();
  function startMentorChat(mentorId: string, mentorName: string) {
    if (!user) {
      router.push("/auth/student/login");
      return;
    }
    const thread = ensureMentorThread(mentorId, mentorName);
    if (!thread) return;
    router.push(`/messages/${thread.id}`);
  }
  return (
    <div className="grid gap-14 pb-20">
      <section className="rounded-[3rem] border border-transparent bg-gradient-to-br from-[#2c1234] via-[#5c1f3f] to-[#f43f5e] px-6 py-12 text-[var(--sp-surface)] shadow-2xl sm:px-10">
        <p className="text-xs uppercase tracking-[0.4em] text-white/65">ShePlays mentorship lane</p>
        <h1 className="mt-6 text-balance text-4xl font-semibold">Girls Mentorship Network · stories that travel farther than trophies.</h1>
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-white/80">
          Dedicated space outside the booking choreography where athletes decompress, glimpse pro pathways, share nerves,
          collect pep talks anchored in realism — scaffolded today with evocative placeholders awaiting your storytelling CMS.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          {!user ? (
            <>
              <BtnLink href="/auth/student/signup" variant="secondary" className="min-h-12">
                Unlock mentor DMs
              </BtnLink>
              <BtnLink href="/mentorship#mentors" variant="ghost" className="min-h-12 border-white/35 text-white">
                Meet mentors
              </BtnLink>
            </>
          ) : (
            <>
              <Btn variant="secondary" type="button" onClick={() => router.push("/messages")}>
                Mentorship inbox
              </Btn>
              <Btn variant="ghost" type="button" className="text-white underline" onClick={() => router.push("/dashboard/student")}>
                Back to athlete hub
              </Btn>
            </>
          )}
        </div>
      </section>
      <section className="grid gap-6">
        <h2 className="font-display text-2xl font-semibold">Learning paths</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {LEARNING_PATHS.map((path) => (
            <article key={path.id} className="sp-card p-4">
              <p className="font-semibold">{path.title}</p>
              <p className="mt-1 text-sm text-[var(--sp-muted)]">{path.lessons} lessons</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sp-card p-5">
        <h2 className="font-display text-lg font-semibold">Ask-a-Mentor</h2>
        <p className="mt-2 text-sm text-[var(--sp-muted)]">
          Drop a voice note or message — verified mentors reply within 48 hours. Anonymous option in production.
        </p>
        <Btn variant="primary" type="button" className="mt-4" onClick={() => router.push("/messages")}>
          Open mentor inbox
        </Btn>
      </section>

      <section id="mentors" className="grid gap-10">
        <header>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--sp-teal)]">Mentors on deck</p>
          <h2 className="mt-4 text-3xl font-semibold text-[var(--sp-ink)]">Placeholder heroines powering early pilots</h2>
          <p className="mt-4 max-w-2xl text-sm text-[var(--sp-muted)]">
            Swap thumbnails for your ambassadors; keep tone intimate and parent-safe.
          </p>
        </header>
        <div className="grid gap-6 sm:grid-cols-3">
          {PLACEHOLDER_MENTORS.map((mentor) => (
            <article
              key={mentor.id}
              className="flex flex-col gap-4 rounded-3xl border border-black/10 bg-white p-4 shadow-inner"
            >
              <Image
                src={mentor.avatarUrl}
                alt=""
                width={360}
                height={240}
                className="h-40 w-full rounded-2xl object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-[var(--sp-ink)]">{mentor.name}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--sp-muted)]">{mentor.sport}</p>
                <p className="mt-3 text-sm text-[var(--sp-muted)]">{mentor.bio}</p>
              </div>
              <Btn variant="secondary" type="button" className="mt-auto justify-center" onClick={() => startMentorChat(mentor.id, mentor.name)}>
                Message privately
              </Btn>
            </article>
          ))}
        </div>
      </section>
      <section className="grid gap-8">
        <header>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--sp-muted)]">ShePlays TV (placeholder)</p>
          <h2 className="mt-4 text-3xl font-semibold text-[var(--sp-ink)]">Micro interviews & sparks of courage</h2>
        </header>
        <div className="grid gap-6 lg:grid-cols-3">
          {PLACEHOLDER_MENTOR_VIDEOS.map((video) => (
            <figure key={video.id} className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm">
              <div className="relative h-40 w-full">
                <Image
                  src={video.thumbUrl}
                  alt=""
                  fill
                  sizes="(max-width:1024px) 100vw, 33vw"
                  className="object-cover"
                />
                <figcaption className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/35 text-sm font-semibold text-white">
                  Interview clip placeholder
                </figcaption>
              </div>
              <figcaption className="space-y-1 px-4 py-4">
                <p className="font-semibold text-[var(--sp-ink)]">{video.title}</p>
                <p className="text-xs text-[var(--sp-muted)]">{video.mentorName}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      {!ready ? null : (
        <p className="text-center text-xs text-[var(--sp-muted)]">
          Mentor threads stay separate from paid coaching chats so guardians always know context.
        </p>
      )}
    </div>
  );
}
