// ─── Sādhana / Spiritual Practice ────────────────────────────────────────────

export type SadhanaItem = {
  id: string;
  title: string;          // e.g. "Morning Puja", "Japa"
  subtitle?: string;      // e.g. "108 rounds of OM Namah Shivaya"
  durationMin: number;    // expected duration in minutes
  completed: boolean;
  category: 'puja' | 'japa' | 'meditation' | 'reading' | 'service' | 'other';
};

export type DailyProgress = {
  date: string;           // ISO date string "YYYY-MM-DD" (local calendar day)
  completed: string[];    // ids of completed SadhanaItems
};

// ─── Goals (set by spiritual guide) ───────────────────────────────────────────

export type Goal = {
  id: string;
  title: string;
  description?: string;
  targetCount: number;    // e.g. 108 times, 30 days
  currentCount: number;
  unit: string;           // "days", "rounds", "pages", "minutes"
  deadline?: string;      // ISO date
  assignedBy: string;     // guide's name or "self"
  category: SadhanaItem['category'];
};

// ─── Learn ────────────────────────────────────────────────────────────────────

export type ContentType = 'reading' | 'listening';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard' | 'extreme';

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: QuestionDifficulty;
};

export type Lesson = {
  id: string;
  title: string;
  description: string;
  contentType: ContentType;
  bodyText?: string;          // for reading
  audioUrl?: string;          // for listening
  durationMin?: number;       // for audio
  category: string;
  questions: QuizQuestion[];  // ordered easy → medium → hard → extreme
  completed: boolean;
  score?: number;             // 0–100
};

// ─── Achievements ─────────────────────────────────────────────────────────────

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;           // Ionicons name
  unlockedAt?: string;    // ISO date; undefined = locked
  category: 'streak' | 'learning' | 'service' | 'sadhana' | 'milestone';
};

// ─── Settings / Logs / Quiz ───────────────────────────────────────────────────

export type Settings = {
  reminderEnabled: boolean;
  reminderTime: string; // "HH:MM" 24-hour
};

/** Lowercase alias — the store contract refers to the settings object type. */
export type settings = Settings;

export type JapaState = {
  date: string; // ISO date "YYYY-MM-DD" the rounds count belongs to
  rounds: number;
};

export type MeditationEntry = {
  date: string; // ISO date "YYYY-MM-DD"
  minutes: number;
};

export type SevaEntry = {
  date: string; // ISO date "YYYY-MM-DD"
};

export type ActiveQuiz = {
  lessonId: string;
  qIndex: number;
  correct: number;
};

// ─── User / Profile ───────────────────────────────────────────────────────────

export type UserProfile = {
  id: string;
  displayName: string;
  spiritualName?: string;
  guideName?: string;
  avatarUri?: string;
  joinedAt: string;         // ISO date
  currentStreak: number;
  longestStreak: number;
  totalDaysCompleted: number;
};
