export const SPORTS = [
  "Cricket",
  "Football",
  "Tennis",
  "Basketball",
  "Track & Field",
  "Badminton",
  "Swimming",
  "Volleyball",
  "Other",
] as const;

export const LANGUAGES = ["English", "Hindi", "Tamil", "Gujarati", "Punjabi"] as const;

export const SESSION_DURATIONS = [45, 60, 90] as const;

export const PLATFORM_COMMISSION = 0.15;

export const PARENT_PROMPTS = [
  "How did today's session go?",
  "What should we work on next time?",
  "Is my athlete ready for competition?",
] as const;

export const LEARNING_PATHS = [
  { id: "confidence", title: "Confidence Boost 101", lessons: 6 },
  { id: "leadership", title: "Leadership On & Off the Field", lessons: 8 },
  { id: "injury", title: "What to Do After an Injury", lessons: 5 },
] as const;
