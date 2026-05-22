"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AreaSelect } from "@/components/area-select";
import { CoachSwipeDeck } from "@/components/coach-swipe-deck";
import { PeerPlayPanel } from "@/components/peer-play-panel";
import { locationContainsArea } from "@/lib/locations";
import { SPORTS, LANGUAGES } from "@/lib/constants";
import { areaMatches } from "@/lib/peer-match";
import { useShePlays } from "@/providers/sheplays-provider";

type DiscoverMode = "swipe" | "peer";

export default function CoachesPage() {
  const router = useRouter();
  const { allCoaches, allSessions, persisted, updateStudentProfile } = useShePlays();
  const homeArea = persisted.studentProfile?.area ?? "Singapore";

  const [mode, setMode] = useState<DiscoverMode>("swipe");
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [sport, setSport] = useState("all");
  const [areaFilter, setAreaFilter] = useState(homeArea);
  const [locationMode, setLocationMode] = useState<"all" | "nearby" | "virtual">("all");
  const [femaleOnly, setFemaleOnly] = useState(false);
  const [language, setLanguage] = useState("all");
  const [maxPrice, setMaxPrice] = useState(100);
  const [modesty, setModesty] = useState(false);
  const [peerEnabled, setPeerEnabled] = useState(true);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return allCoaches.filter((coach) => {
      if (needle) {
        const hay = `${coach.name} ${coach.sport} ${coach.location} ${coach.bio}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      if (sport !== "all" && coach.sport !== sport) return false;
      if (femaleOnly && !coach.isFemaleCoach) return false;
      if (language !== "all" && !coach.languages.includes(language)) return false;
      if ((coach.price60 ?? coach.hourlyRateUsd) > maxPrice) return false;
      if (locationMode === "virtual" && !coach.isVirtual) return false;
      if (locationMode === "nearby" && coach.isVirtual) return false;
      if (modesty && !coach.isFemaleCoach) return false;
      if (areaFilter && areaFilter !== "all") {
        const inArea =
          areaMatches(coach.location, areaFilter) ||
          locationContainsArea(coach.location, areaFilter);
        if (!inArea && !coach.isVirtual) return false;
      }
      return true;
    });
  }, [
    allCoaches,
    areaFilter,
    femaleOnly,
    language,
    locationMode,
    maxPrice,
    modesty,
    search,
    sport,
  ]);

  const resetFilters = () => {
    setSearch("");
    setSport("all");
    setAreaFilter(homeArea);
    setLocationMode("all");
    setFemaleOnly(false);
    setLanguage("all");
    setMaxPrice(100);
    setModesty(false);
  };

  return (
    <div className="grid gap-6 pb-28">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--sp-teal)]">Explore</p>
        <h1 className="font-display mt-2 text-3xl font-bold text-[var(--sp-ink)]">Find your coach</h1>
        <p className="mt-2 text-sm text-[var(--sp-muted)]">
          Swipe through coaches like a deck, or jump straight to peer pods at your level.
        </p>
      </header>

      <div
        className="grid grid-cols-2 gap-1 rounded-2xl bg-[var(--sp-sand)] p-1"
        role="tablist"
        aria-label="Discover mode"
      >
        {(
          [
            { id: "swipe" as const, label: "Swipe coaches" },
            { id: "peer" as const, label: "Peer pods" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={mode === tab.id}
            onClick={() => setMode(tab.id)}
            className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              mode === tab.id
                ? "bg-white text-[var(--sp-ink)] shadow-sm"
                : "text-[var(--sp-muted)] hover:text-[var(--sp-ink)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === "swipe" ? (
        <>
          <div className="flex items-center justify-between gap-3">
            <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--sp-muted)]">
              Area
              <AreaSelect
                value={areaFilter}
                onChange={(v) => {
                  setAreaFilter(v);
                  updateStudentProfile({ area: v });
                }}
                className="w-full rounded-2xl border border-black/10 bg-white px-3 py-2.5 text-sm font-medium text-[var(--sp-ink)]"
              />
            </label>
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className="mt-5 shrink-0 rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-[var(--sp-violet)]"
            >
              {showFilters ? "Hide" : "Filters"}
            </button>
          </div>

          {showFilters ? (
            <div className="sp-card grid gap-4 p-4 sm:p-5">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, sport, city…"
                className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none ring-[var(--sp-violet)] focus:ring-2"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm font-medium">
                  Sport
                  <select
                    value={sport}
                    onChange={(e) => setSport(e.target.value)}
                    className="rounded-2xl border px-3 py-2.5"
                  >
                    <option value="all">All sports</option>
                    {SPORTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium">
                  Language
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="rounded-2xl border px-3 py-2.5"
                  >
                    <option value="all">Any</option>
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                {(["all", "nearby", "virtual"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setLocationMode(m)}
                    className={`rounded-full px-3 py-1.5 font-medium capitalize ${
                      locationMode === m ? "bg-[var(--sp-violet)] text-white" : "bg-[var(--sp-sand)]"
                    }`}
                  >
                    {m === "all" ? "Any location" : m}
                  </button>
                ))}
              </div>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Max price: ${maxPrice}
                <input
                  type="range"
                  min={20}
                  max={100}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="accent-[var(--sp-violet)]"
                />
              </label>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={femaleOnly} onChange={() => setFemaleOnly((v) => !v)} />
                  Female coaches only
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={modesty} onChange={() => setModesty((v) => !v)} />
                  Modesty / cultural sensitivity
                </label>
              </div>
            </div>
          ) : null}

          <CoachSwipeDeck coaches={filtered} onEmpty={resetFilters} />

          <p className="text-center text-xs text-[var(--sp-muted)]">
            ← skip · ♥ profile · 📅 book · {filtered.length} matching
          </p>
        </>
      ) : (
        <PeerPlayPanel
          enabled={peerEnabled}
          onEnabledChange={setPeerEnabled}
          profile={persisted.studentProfile}
          allSessions={allSessions}
          allCoaches={allCoaches}
          onUpdateProfile={updateStudentProfile}
          onPickSession={(session, coach) => router.push(`/book/${coach.id}?session=${session.id}`)}
          variant="browse"
        />
      )}

      {mode === "swipe" ? (
        <button
          type="button"
          onClick={() => setMode("peer")}
          className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-4 right-4 z-30 mx-auto flex max-w-lg items-center justify-center gap-2 rounded-2xl border border-[var(--sp-teal)]/40 bg-[color-mix(in_oklab,var(--sp-teal)_12%,white)] px-4 py-3 text-sm font-semibold text-[var(--sp-teal)] shadow-lg backdrop-blur-sm"
        >
          <span aria-hidden>🤝</span>
          Play with athletes at my level
        </button>
      ) : null}
    </div>
  );
}
