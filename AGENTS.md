# ShePlays (sanghplay.com)

Marketplace + mentorship app for girls in youth sports. Students (or parents on
their behalf) browse verified coaches, book private/group sessions, chat with
the coach after booking, track training goals, and talk to mentors. Coaches
onboard a listing, publish sessions, set availability, and accept booking
requests. Pro athletes can publish a public "Sponsor me" page.

Status: **prototype**. There is no backend of its own. See "State model" below
before assuming anything is real.

## Stack

- Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4.
- Supabase (`@supabase/ssr`) for auth only, and only when
  `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set.
- No tests, no CI, no middleware, no API routes, no server actions.

## This is NOT the Next.js you know

This version has breaking changes. APIs, conventions, and file structure may
differ from your training data. After `npm install`, read the relevant guide in
`node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## State model (read this first)

Every page is a client component. All app state lives in one React context,
`src/providers/sheplays-provider.tsx`, and is mirrored to
`localStorage["sheplays:v2"]` by `src/lib/local-persist.ts`. Shape is
`PersistedState` in `src/lib/types.ts`.

Consequences:

- Bookings, chats, coach listings, goals, badges, and payments exist only in
  the current browser. Two users never see each other's data.
- "Payment" (`confirmBookingPayment`) just flips a status flag.
- Auth has two modes chosen by `isSupabaseConfigured()`:
  - **demo**: any email + 6-char password signs you in as whatever role the
    URL says. Nothing is verified.
  - **supabase**: real sign-up/sign-in, but role and `onboarding_complete`
    are read from client-writable `user_metadata`. Nothing else touches
    Supabase; `supabase/schema.sql` creates a `profiles` table the app never
    reads.
- Route protection is client-side redirects in each page. Do not treat any of
  it as a security boundary.

When adding a real backend, the seam is the provider's callbacks
(`createPendingBooking`, `addChatMessage`, `upsertCoachProfile`, ...). Keep
page components calling those and swap the implementation.

## Layout

- `src/app/` routes. Auth pages are `auth/{role}/{login,signup}` wrapping one
  `RoleAuthPanel`. Dashboards per role under `dashboard/`.
- `src/components/` UI. `button.tsx` (`Btn`) is the shared button.
- `src/lib/placeholder-data.ts` seeded coaches, sessions, mentors, news,
  reviews. Merged with user-created data in the provider.
- `src/lib/coach-id.ts` maps a user key to a coach listing id. Chat access
  for coaches depends on this mapping; keep it deterministic.
- Styling uses CSS vars `--sp-*` from `src/app/globals.css` and `sp-card`
  style utility classes. Match those rather than inventing colours.

## Commands

```
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build
```

## Conventions

- Client components only, `"use client"` at top. There is no server data
  layer yet; do not add one piecemeal.
- Ids come from `crypto.randomUUID()` via `nanoidSimple()` in the provider.
- Currency is USD numbers, formatted with `formatUsd` in `src/lib/format.ts`.
- Copy is intentionally warm and parent-facing. Keep that tone in UI strings.
