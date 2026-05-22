/** Grouped home areas for athlete peer matching & coach discovery filters */
export const LOCATION_REGIONS = {
  Singapore: ["Singapore"],
  India: [
    "Mumbai",
    "Bangalore",
    "Chennai",
    "Delhi",
    "Hyderabad",
    "Pune",
  ],
  "United States": [
    "Austin",
    "Boston",
    "Chicago",
    "Los Angeles",
    "Miami",
    "New York",
    "San Francisco",
    "Seattle",
  ],
  "United Kingdom": [
    "London",
    "Manchester",
    "Birmingham",
    "Edinburgh",
    "Glasgow",
  ],
} as const;

export type LocationRegion = keyof typeof LOCATION_REGIONS;

export const ALL_AREAS: string[] = Object.values(LOCATION_REGIONS).flat();

/** Loose aliases so “NYC” still matches New York coaches */
const AREA_ALIASES: Record<string, string[]> = {
  singapore: ["singapore", "sg"],
  mumbai: ["mumbai", "bombay"],
  bangalore: ["bangalore", "bengaluru"],
  "new york": ["new york", "nyc", "manhattan", "brooklyn"],
  "los angeles": ["los angeles", "la", "l.a."],
  "san francisco": ["san francisco", "sf", "bay area"],
  london: ["london", "greater london"],
  manchester: ["manchester", "mcr"],
};

export function normalizeAreaToken(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function areaTokensForMatch(userArea: string): string[] {
  const base = normalizeAreaToken(userArea);
  const aliases = AREA_ALIASES[base] ?? [base];
  return [...new Set(aliases)];
}

export function locationContainsArea(location: string, userArea: string) {
  const hay = normalizeAreaToken(
    location.replace(/^Virtual\s*·\s*/i, "").split(",")[0] ?? location,
  );
  const fullHay = normalizeAreaToken(location);

  return areaTokensForMatch(userArea).some(
    (token) => hay.includes(token) || fullHay.includes(token) || token.includes(hay),
  );
}
