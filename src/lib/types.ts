export type UserRole = "student" | "parent" | "coach" | "mentor";

export type SessionType = "private" | "group";

export type BookingStatus =
  | "pending_payment"
  | "confirmed"
  | "past"
  | "cancelled";

export type RequestStatus = "pending" | "accepted" | "declined";

export type TrustBadgeId =
  | "responsive"
  | "trusted_parents"
  | "ten_girls"
  | "preferred_girls"
  | "green_travel";

export type CoachListing = {
  id: string;
  name: string;
  avatarUrl: string;
  sport: string;
  location: string;
  levelTags: string[];
  sessionTypes: SessionType[];
  isFemaleCoach: boolean;
  trustScore: number;
  bio: string;
  experienceYears: number;
  certifications: string[];
  hourlyRateUsd: number;
  groupRateUsd?: number;
  rating: number;
  reviewCount: number;
  languages: string[];
  isVirtual: boolean;
  greenTravel?: boolean;
  badges: TrustBadgeId[];
  videoIntroUrl?: string;
  price45?: number;
  price60?: number;
  price90?: number;
};

export type SessionPost = {
  id: string;
  coachId: string;
  title: string;
  sport: string;
  level: string;
  location: string;
  sessionType: SessionType;
  startsAt: string;
  durationMin: number;
  priceUsd: number;
  spotsTotal?: number;
  spotsLeft?: number;
};

export type Booking = {
  id: string;
  coachId: string;
  coachName: string;
  studentKey: string;
  studentName: string;
  startsAt: string;
  status: BookingStatus;
  sport: string;
  sessionType: SessionType;
  amountUsd: number;
  durationMin: number;
  isVirtual: boolean;
  createdAt: string;
};

export type BookingRequest = {
  id: string;
  coachId: string;
  studentKey: string;
  studentName: string;
  message: string;
  status: RequestStatus;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  authorKey: string;
  body: string;
  createdAt: string;
};

export type ChatThread = {
  id: string;
  kind: "session" | "mentor" | "parent";
  title: string;
  bookingId?: string;
  coachId?: string;
  mentorId?: string;
  participantKeys: string[];
  participantNames: Record<string, string>;
  messages: ChatMessage[];
  updatedAt: string;
  locked?: boolean;
};

export type StudentGoal = {
  id: string;
  label: string;
  type: "weekly_sessions" | "skill" | "fitness";
  target: number;
  current: number;
};

export type EarnedBadge = {
  id: string;
  emoji: string;
  title: string;
  awardedAt: string;
  fromCoach?: string;
};

export type MoodEntry = {
  id: string;
  bookingId?: string;
  mood: 1 | 2 | 3 | 4 | 5;
  note?: string;
  createdAt: string;
  sharedWithMentor?: boolean;
};

export type StudentProfile = {
  sports: string[];
  weeklySessionGoal: number;
  /** e.g. Club, Beginner — used for peer group matching */
  skillLevel?: string;
  /** City / metro for nearby group pods */
  area?: string;
  age?: number;
  parentLinked?: boolean;
  /** Elite / pro athletes can publish a sponsor page */
  isProAthlete?: boolean;
  sponsorMeEnabled?: boolean;
  sponsorMeHeadline?: string;
  sponsorMeStory?: string;
};

export type DemoUser = {
  email: string;
  name: string;
  role: UserRole;
  onboardingComplete: boolean;
  childName?: string;
};

export type NewsItem = {
  id: string;
  title: string;
  sport: string;
  excerpt: string;
  publishedAt: string;
  kind: "news" | "community" | "event" | "spotlight";
};

export type CoachReview = {
  id: string;
  coachId: string;
  author: string;
  role: "parent" | "student";
  rating: number;
  body: string;
  createdAt: string;
};

export type PersistedState = {
  version: 2;
  demoUser: DemoUser | null;
  customCoaches: Record<string, CoachListing>;
  sessions: SessionPost[];
  bookings: Booking[];
  bookingRequests: BookingRequest[];
  threads: ChatThread[];
  coachAvailabilityRule: {
    slots: Record<number, string[]>;
  } | null;
  studentProfile: StudentProfile | null;
  goals: StudentGoal[];
  earnedBadges: EarnedBadge[];
  moodJournal: MoodEntry[];
  lastCoachId?: string;
};
