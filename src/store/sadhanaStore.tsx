/**
 * Sādhana Store — React Context + useReducer, persisted to AsyncStorage.
 *
 * Streak model: a local-calendar day counts once EVERY sādhana item is
 * checked. Completed days are recorded in `completedDates`; streak stats are
 * *recomputed* from that list (never incremented) so un-checking an item and
 * day rollover always stay consistent.
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  ReactNode,
} from 'react';
import { AppState as RNAppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SadhanaItem,
  DailyProgress,
  Goal,
  Lesson,
  Achievement,
  UserProfile,
  Settings,
  JapaState,
  MeditationEntry,
  SevaEntry,
  ActiveQuiz,
  QuizQuestion,
} from '../types';
import { addDaysISO, getTodayISO } from '../utils/date';

export const STORAGE_KEY = 'sadhana:state:v2';

// Upper bound on the launch storage read before the app boots with seeds
// rather than hanging on the splash screen (see StoreProvider).
const LOAD_TIMEOUT_MS = 4000;

/** Rounds of japa that complete the daily japa practice. */
export const JAPA_ROUNDS_TARGET = 108;

// ─── Seed Data ────────────────────────────────────────────────────────────────

const DEFAULT_SADHANA: SadhanaItem[] = [
  {
    id: 's1',
    title: 'Morning Puja',
    subtitle: 'Light a lamp, offer flowers',
    durationMin: 20,
    completed: false,
    category: 'puja',
  },
  {
    id: 's2',
    title: 'Japa',
    subtitle: '108 rounds — Hare Krishna Mahāmantra',
    durationMin: 30,
    completed: false,
    category: 'japa',
  },
  {
    id: 's3',
    title: 'Morning Meditation',
    subtitle: 'Breath awareness · 15 min',
    durationMin: 15,
    completed: false,
    category: 'meditation',
  },
  {
    id: 's4',
    title: 'Scriptural Reading',
    subtitle: 'Bhagavad Gītā — one chapter',
    durationMin: 20,
    completed: false,
    category: 'reading',
  },
];

const DEFAULT_GOALS: Goal[] = [
  {
    id: 'g1',
    title: 'Complete 30 days of Japa',
    description: 'Assigned by Guruji for inner stillness',
    targetCount: 30,
    currentCount: 0,
    unit: 'days',
    assignedBy: 'Guruji',
    category: 'japa',
  },
  {
    id: 'g2',
    title: 'Read all 18 chapters of Gītā',
    targetCount: 18,
    currentCount: 0,
    unit: 'chapters',
    assignedBy: 'Guruji',
    category: 'reading',
  },
  {
    id: 'g3',
    title: 'Attend 10 seva sessions',
    targetCount: 10,
    currentCount: 0,
    unit: 'sessions',
    assignedBy: 'self',
    category: 'service',
  },
];

const DEFAULT_LESSONS: Lesson[] = [
  {
    id: 'l1',
    title: 'What is Sādhana?',
    description: 'Understanding the purpose of daily spiritual practice.',
    contentType: 'reading',
    category: 'Philosophy',
    bodyText: `Sādhana is the Sanskrit word for "a means of accomplishing something." In the spiritual context it refers to a daily set of disciplines that purify the mind and draw one closer to the Divine.

The consistency of practice matters more than its duration. Even five minutes of sincere meditation outweighs an hour of distracted ritual.

Sage Patañjali describes it as: abhyāsa vairāgyābhyāṃ tannirodhaḥ — "by practice and non-attachment, the mind's fluctuations are stilled."`,
    questions: [
      {
        id: 'q1a',
        question: 'What is the Sanskrit meaning of "Sādhana"?',
        options: [
          'A type of prayer',
          'A means of accomplishing something',
          'A form of temple worship',
          'A sacred text',
        ],
        correctIndex: 1,
        explanation: 'Sādhana literally means "a means of accomplishing." It refers to regular spiritual disciplines.',
        difficulty: 'easy',
      },
      {
        id: 'q1b',
        question: 'According to the lesson, what matters more than duration?',
        options: ['The place of practice', 'Consistency', 'The teacher\'s presence', 'Silence'],
        correctIndex: 1,
        explanation: 'The lesson emphasises that consistent practice, even if brief, is more valuable than long but distracted practice.',
        difficulty: 'medium',
      },
      {
        id: 'q1c',
        question: 'Which sage described the stilling of the mind\'s fluctuations?',
        options: ['Śaṅkarācārya', 'Vālmīki', 'Patañjali', 'Vyāsa'],
        correctIndex: 2,
        explanation: 'Patañjali\'s Yoga Sūtras 1.12 speaks of abhyāsa and vairāgya as the two pillars for stilling the mind.',
        difficulty: 'hard',
      },
      {
        id: 'q1d',
        question: 'Complete the sūtra: "abhyāsa vairāgyābhyāṃ ___"',
        options: ['yogaścitta', 'tannirodhaḥ', 'samādhiḥ', 'vṛttayaḥ'],
        correctIndex: 1,
        explanation: 'The full sūtra is: abhyāsa vairāgyābhyāṃ tannirodhaḥ — the mind\'s fluctuations are stilled by practice and non-attachment.',
        difficulty: 'extreme',
      },
    ],
    completed: false,
  },
  {
    id: 'l2',
    title: 'The Three Paths of Yoga',
    description: 'Jñāna, Bhakti, and Karma — three roads to the same summit.',
    contentType: 'reading',
    category: 'Philosophy',
    bodyText: `The Bhagavad Gītā presents three primary paths of yoga, suited to different temperaments:

**Jñāna Yoga** — the path of knowledge and discrimination (viveka). Through inquiry into the nature of the Self, the seeker dissolves the illusion of separateness.

**Bhakti Yoga** — the path of devotion and love. The devotee surrenders ego to the Divine through prayer, chanting, and service, allowing grace to do the purifying.

**Karma Yoga** — the path of selfless action. Work offered to the Divine without attachment to results purifies the heart and transcends the cycle of cause and effect.

Śrī Krishna says: "All three lead to Me." A practitioner often blends all three, led by their natural inclination.`,
    questions: [
      {
        id: 'q2a',
        question: 'Which yoga path is based on selfless action?',
        options: ['Jñāna Yoga', 'Bhakti Yoga', 'Karma Yoga', 'Rāja Yoga'],
        correctIndex: 2,
        explanation: 'Karma Yoga is the path of selfless action performed without attachment to results.',
        difficulty: 'easy',
      },
      {
        id: 'q2b',
        question: 'What does "viveka" mean in the context of Jñāna Yoga?',
        options: ['Devotion', 'Discrimination / discernment', 'Service', 'Concentration'],
        correctIndex: 1,
        explanation: 'Viveka means discrimination or discernment — the ability to distinguish between the real (Self) and the unreal (ego/world).',
        difficulty: 'medium',
      },
      {
        id: 'q2c',
        question: 'According to the Gītā, how many paths ultimately lead to Śrī Krishna?',
        options: ['Only Bhakti Yoga', 'Only Karma Yoga', 'All three paths', 'None — liberation is beyond all paths'],
        correctIndex: 2,
        explanation: 'Śrī Krishna declares in the Gītā that all three paths — Jñāna, Bhakti, and Karma Yoga — lead to Him.',
        difficulty: 'hard',
      },
      {
        id: 'q2d',
        question: 'In Bhakti Yoga, what is the primary mechanism of purification described in the lesson?',
        options: [
          'Intellectual analysis of scriptures',
          'Surrender of ego through prayer, chanting, and service, allowing grace to purify',
          'Rigorous fasting and austerity',
          'Silent meditation on the formless Absolute',
        ],
        correctIndex: 1,
        explanation: 'The lesson describes Bhakti Yoga as surrendering the ego to the Divine, and grace doing the purifying — not the devotee\'s own effort alone.',
        difficulty: 'extreme',
      },
    ],
    completed: false,
  },
];

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'a1',
    title: 'First Step',
    description: 'Complete your sādhana on Day 1',
    icon: 'footsteps-outline',
    category: 'streak',
  },
  {
    id: 'a2',
    title: '7-Day Flame',
    description: 'Maintain a 7-day sādhana streak',
    icon: 'flame-outline',
    category: 'streak',
  },
  {
    id: 'a3',
    title: '30-Day Vow',
    description: 'Complete 30 consecutive days of sādhana',
    icon: 'ribbon-outline',
    category: 'milestone',
  },
  {
    id: 'a4',
    title: 'Seeker',
    description: 'Complete your first lesson',
    icon: 'book-outline',
    category: 'learning',
  },
  {
    id: 'a5',
    title: 'Scholar',
    description: 'Answer an Extreme-difficulty question correctly',
    icon: 'school-outline',
    category: 'learning',
  },
  {
    id: 'a6',
    title: 'Seva Heart',
    description: 'Log 5 seva sessions',
    icon: 'heart-outline',
    category: 'service',
  },
];

const DEFAULT_PROFILE: UserProfile = {
  id: 'u1',
  displayName: 'Devotee',
  guideName: 'Guruji',
  joinedAt: new Date().toISOString(),
  currentStreak: 0,
  longestStreak: 0,
  totalDaysCompleted: 0,
};

const DEFAULT_SETTINGS: Settings = {
  reminderEnabled: false,
  reminderTime: '06:00',
};

// ─── State & Reducer ──────────────────────────────────────────────────────────

export type AppState = {
  sadhanaItems: SadhanaItem[];
  todayProgress: DailyProgress;
  /** Local-day "YYYY-MM-DD" dates on which every sādhana item was completed. */
  completedDates: string[];
  goals: Goal[];
  lessons: Lesson[];
  achievements: Achievement[];
  profile: UserProfile;
  /** True once the user has finished onboarding. */
  onboarded: boolean;
  settings: Settings;
  /** Japa round counter for the day in `japa.date`. */
  japa: JapaState;
  meditationLog: MeditationEntry[];
  sevaLog: SevaEntry[];
  /** In-progress quiz, if the user left a lesson quiz mid-way. */
  activeQuiz: ActiveQuiz | null;
};

export type Action =
  | { type: 'HYDRATE'; state: AppState }
  | { type: 'ROLL_OVER'; today: string }
  | { type: 'TOGGLE_SADHANA'; id: string; today: string }
  | { type: 'UPDATE_GOAL'; id: string; increment: number }
  | { type: 'COMPLETE_LESSON'; id: string; score: number }
  | { type: 'UNLOCK_ACHIEVEMENT'; id: string }
  | { type: 'UPDATE_PROFILE'; patch: Partial<UserProfile> }
  | { type: 'COMPLETE_ONBOARDING'; displayName: string; guideName?: string; practiceIds: string[] }
  | { type: 'ADD_SADHANA'; title: string; subtitle?: string; durationMin: number; category: SadhanaItem['category'] }
  | { type: 'UPDATE_SADHANA'; id: string; patch: Partial<Pick<SadhanaItem, 'title' | 'subtitle' | 'durationMin' | 'category'>> }
  | { type: 'REMOVE_SADHANA'; id: string }
  | { type: 'REORDER_SADHANA'; ids: string[] }
  | { type: 'ADD_GOAL'; title: string; targetCount: number; unit: string; category: Goal['category']; assignedBy: string }
  | { type: 'REMOVE_GOAL'; id: string }
  | { type: 'LOG_JAPA_ROUND'; today: string }
  | { type: 'LOG_MEDITATION'; date: string; minutes: number }
  | { type: 'LOG_SEVA'; date: string }
  | { type: 'SAVE_QUIZ'; lessonId: string; qIndex: number; correct: number }
  | { type: 'CLEAR_QUIZ' }
  | { type: 'UPDATE_SETTINGS'; patch: Partial<Settings> }
  | { type: 'RESET_ALL' };

export type StreakStats = Pick<UserProfile, 'currentStreak' | 'longestStreak' | 'totalDaysCompleted'>;

/**
 * Derive streak stats from the set of fully-completed days.
 * The streak is alive when today — or, if today isn't done yet, yesterday —
 * is in the set; it breaks only after a full missed day.
 */
export function recomputeStreak(completedDates: string[], today: string): StreakStats {
  const set = new Set(completedDates);

  let currentStreak = 0;
  let cursor = set.has(today) ? today : addDaysISO(today, -1);
  while (set.has(cursor)) {
    currentStreak += 1;
    cursor = addDaysISO(cursor, -1);
  }

  let longestStreak = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of [...set].sort()) {
    run = prev !== null && addDaysISO(prev, 1) === d ? run + 1 : 1;
    longestStreak = Math.max(longestStreak, run);
    prev = d;
  }

  return { currentStreak, longestStreak, totalDaysCompleted: set.size };
}

function unlock(achievements: Achievement[], id: string): Achievement[] {
  return achievements.map((a) =>
    a.id === id && !a.unlockedAt
      ? { ...a, unlockedAt: new Date().toISOString() }
      : a
  );
}

/** Unlocks streak-based milestones. Unlocking is monotonic — never re-locks. */
function achievementsForStreak(
  achievements: Achievement[],
  stats: StreakStats,
): Achievement[] {
  let next = achievements;
  if (stats.totalDaysCompleted >= 1) next = unlock(next, 'a1');
  if (stats.currentStreak >= 7) next = unlock(next, 'a2');
  if (stats.currentStreak >= 30) next = unlock(next, 'a3');
  return next;
}

/** Reset the checklist for a new day (completion history is preserved). */
function applyRollover(state: AppState, today: string): AppState {
  if (state.todayProgress.date === today) return state;
  const sadhanaItems = state.sadhanaItems.map((i) => ({ ...i, completed: false }));
  const stats = recomputeStreak(state.completedDates, today);
  return {
    ...state,
    sadhanaItems,
    todayProgress: { date: today, completed: [] },
    profile: { ...state.profile, ...stats },
  };
}

/**
 * Shared "all-done" bookkeeping used after any checklist change: rebuild the
 * completed-id list, add/remove `today` from `completedDates`, recompute
 * streak stats and check streak achievements.
 */
function applyChecklistResult(prev: AppState, items: SadhanaItem[], today: string): AppState {
  const completed = items.filter((i) => i.completed).map((i) => i.id);
  const allDone = items.length > 0 && completed.length === items.length;

  let completedDates = prev.completedDates;
  const hasToday = completedDates.includes(today);
  if (allDone && !hasToday) {
    completedDates = [...completedDates, today];
  } else if (!allDone && hasToday) {
    completedDates = completedDates.filter((d) => d !== today);
  }

  const stats = recomputeStreak(completedDates, today);
  const achievements = achievementsForStreak(prev.achievements, stats);
  return {
    ...prev,
    sadhanaItems: items,
    todayProgress: { date: today, completed },
    completedDates,
    profile: { ...prev.profile, ...stats },
    achievements,
  };
}

// ─── Migration ────────────────────────────────────────────────────────────────

const SADHANA_CATEGORIES: SadhanaItem['category'][] = [
  'puja', 'japa', 'meditation', 'reading', 'service', 'other',
];
const ACHIEVEMENT_CATEGORIES: Achievement['category'][] = [
  'streak', 'learning', 'service', 'sadhana', 'milestone',
];
const QUESTION_DIFFICULTIES: QuizQuestion['difficulty'][] = [
  'easy', 'medium', 'hard', 'extreme',
];
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function asBool(v: unknown, fallback: boolean): boolean {
  return typeof v === 'boolean' ? v : fallback;
}

function asOptionalString(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

function asNonNegativeInt(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.floor(v)) : fallback;
}

function isISODate(v: unknown): v is string {
  return typeof v === 'string' && ISO_DATE_RE.test(v);
}

function migrateSadhanaItems(v: unknown, fallback: SadhanaItem[]): SadhanaItem[] {
  if (!Array.isArray(v)) return fallback;
  const out: SadhanaItem[] = [];
  for (const raw of v) {
    if (!isRecord(raw) || typeof raw.id !== 'string') continue;
    out.push({
      id: raw.id,
      title: typeof raw.title === 'string' && raw.title.length > 0 ? raw.title : 'Untitled Practice',
      subtitle: asOptionalString(raw.subtitle),
      durationMin: asNonNegativeInt(raw.durationMin, 15),
      completed: asBool(raw.completed, false),
      category: SADHANA_CATEGORIES.includes(raw.category as SadhanaItem['category'])
        ? (raw.category as SadhanaItem['category'])
        : 'other',
    });
  }
  return out;
}

function migrateTodayProgress(v: unknown): DailyProgress {
  if (isRecord(v) && isISODate(v.date)) {
    const completed = Array.isArray(v.completed)
      ? v.completed.filter((id): id is string => typeof id === 'string')
      : [];
    return { date: v.date, completed };
  }
  return { date: getTodayISO(), completed: [] };
}

function migrateCompletedDates(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const seen = new Set<string>();
  for (const d of v) {
    if (isISODate(d) && !seen.has(d)) seen.add(d);
  }
  return [...seen];
}

function migrateGoals(v: unknown, fallback: Goal[]): Goal[] {
  if (!Array.isArray(v)) return fallback;
  const out: Goal[] = [];
  for (const raw of v) {
    if (!isRecord(raw) || typeof raw.id !== 'string') continue;
    const targetCount = Math.max(1, asNonNegativeInt(raw.targetCount, 1));
    out.push({
      id: raw.id,
      title: typeof raw.title === 'string' && raw.title.length > 0 ? raw.title : 'Untitled Goal',
      description: asOptionalString(raw.description),
      targetCount,
      currentCount: Math.min(asNonNegativeInt(raw.currentCount, 0), targetCount),
      unit: typeof raw.unit === 'string' && raw.unit.length > 0 ? raw.unit : 'count',
      deadline: asOptionalString(raw.deadline),
      assignedBy: typeof raw.assignedBy === 'string' ? raw.assignedBy : 'self',
      category: SADHANA_CATEGORIES.includes(raw.category as Goal['category'])
        ? (raw.category as Goal['category'])
        : 'other',
    });
  }
  return out;
}

function migrateQuestions(v: unknown): QuizQuestion[] {
  if (!Array.isArray(v)) return [];
  const out: QuizQuestion[] = [];
  for (const raw of v) {
    if (!isRecord(raw) || typeof raw.id !== 'string' || typeof raw.question !== 'string') continue;
    const options = Array.isArray(raw.options)
      ? raw.options.filter((o): o is string => typeof o === 'string')
      : [];
    if (options.length === 0) continue;
    const correctIndex = typeof raw.correctIndex === 'number' && Number.isInteger(raw.correctIndex)
      ? raw.correctIndex
      : 0;
    if (correctIndex < 0 || correctIndex >= options.length) continue;
    out.push({
      id: raw.id,
      question: raw.question,
      options,
      correctIndex,
      explanation: typeof raw.explanation === 'string' ? raw.explanation : '',
      difficulty: QUESTION_DIFFICULTIES.includes(raw.difficulty as QuizQuestion['difficulty'])
        ? (raw.difficulty as QuizQuestion['difficulty'])
        : 'medium',
    });
  }
  return out;
}

function migrateLessons(v: unknown, fallback: Lesson[]): Lesson[] {
  if (!Array.isArray(v)) return fallback;
  const out: Lesson[] = [];
  for (const raw of v) {
    if (!isRecord(raw) || typeof raw.id !== 'string') continue;
    const score = typeof raw.score === 'number' && Number.isFinite(raw.score)
      ? Math.min(100, Math.max(0, raw.score))
      : undefined;
    out.push({
      id: raw.id,
      title: typeof raw.title === 'string' ? raw.title : 'Untitled Lesson',
      description: typeof raw.description === 'string' ? raw.description : '',
      contentType: raw.contentType === 'listening' ? 'listening' : 'reading',
      bodyText: asOptionalString(raw.bodyText),
      audioUrl: asOptionalString(raw.audioUrl),
      durationMin: typeof raw.durationMin === 'number' && Number.isFinite(raw.durationMin)
        ? raw.durationMin
        : undefined,
      category: typeof raw.category === 'string' ? raw.category : '',
      questions: migrateQuestions(raw.questions),
      completed: asBool(raw.completed, false),
      ...(score !== undefined ? { score } : null),
    });
  }
  return out;
}

function migrateAchievements(v: unknown, fallback: Achievement[]): Achievement[] {
  if (!Array.isArray(v)) return fallback;
  const out: Achievement[] = [];
  for (const raw of v) {
    if (!isRecord(raw) || typeof raw.id !== 'string') continue;
    out.push({
      id: raw.id,
      title: typeof raw.title === 'string' ? raw.title : 'Achievement',
      description: typeof raw.description === 'string' ? raw.description : '',
      icon: typeof raw.icon === 'string' ? raw.icon : 'ribbon-outline',
      ...(typeof raw.unlockedAt === 'string' ? { unlockedAt: raw.unlockedAt } : null),
      category: ACHIEVEMENT_CATEGORIES.includes(raw.category as Achievement['category'])
        ? (raw.category as Achievement['category'])
        : 'milestone',
    });
  }
  return out;
}

function migrateProfile(v: unknown): UserProfile {
  if (!isRecord(v)) return { ...DEFAULT_PROFILE };
  return {
    id: typeof v.id === 'string' ? v.id : 'u1',
    displayName: typeof v.displayName === 'string' && v.displayName.trim().length > 0
      ? v.displayName
      : 'Devotee',
    spiritualName: asOptionalString(v.spiritualName),
    guideName: asOptionalString(v.guideName),
    avatarUri: asOptionalString(v.avatarUri),
    joinedAt: typeof v.joinedAt === 'string' ? v.joinedAt : new Date().toISOString(),
    currentStreak: asNonNegativeInt(v.currentStreak, 0),
    longestStreak: asNonNegativeInt(v.longestStreak, 0),
    totalDaysCompleted: asNonNegativeInt(v.totalDaysCompleted, 0),
  };
}

function migrateSettings(v: unknown): Settings {
  if (!isRecord(v)) return { ...DEFAULT_SETTINGS };
  return {
    reminderEnabled: asBool(v.reminderEnabled, false),
    reminderTime: typeof v.reminderTime === 'string' && TIME_RE.test(v.reminderTime)
      ? v.reminderTime
      : '06:00',
  };
}

function migrateJapa(v: unknown): JapaState {
  if (!isRecord(v)) return { date: getTodayISO(), rounds: 0 };
  return {
    date: isISODate(v.date) ? v.date : getTodayISO(),
    rounds: asNonNegativeInt(v.rounds, 0),
  };
}

function migrateMeditationLog(v: unknown): MeditationEntry[] {
  if (!Array.isArray(v)) return [];
  const out: MeditationEntry[] = [];
  for (const raw of v) {
    if (!isRecord(raw) || !isISODate(raw.date)) continue;
    if (typeof raw.minutes !== 'number' || !Number.isFinite(raw.minutes)) continue;
    out.push({ date: raw.date, minutes: Math.max(0, raw.minutes) });
  }
  return out;
}

function migrateSevaLog(v: unknown): SevaEntry[] {
  if (!Array.isArray(v)) return [];
  const out: SevaEntry[] = [];
  for (const raw of v) {
    if (isISODate(raw)) {
      out.push({ date: raw });
    } else if (isRecord(raw) && isISODate(raw.date)) {
      out.push({ date: raw.date });
    }
  }
  return out;
}

function migrateActiveQuiz(v: unknown): ActiveQuiz | null {
  if (!isRecord(v)) return null;
  if (typeof v.lessonId !== 'string') return null;
  if (typeof v.qIndex !== 'number' || !Number.isInteger(v.qIndex) || v.qIndex < 0) return null;
  if (typeof v.correct !== 'number' || !Number.isInteger(v.correct) || v.correct < 0) return null;
  return { lessonId: v.lessonId, qIndex: v.qIndex, correct: v.correct };
}

/**
 * Validate saved state field-by-field, falling back to seed defaults for
 * anything missing or corrupt. Accepts `unknown` so it can be fed raw
 * `JSON.parse` output (including v1-shaped payloads that lack the newer
 * fields). Idempotent: `migrate(migrate(x))` deep-equals `migrate(x)`.
 */
export function migrate(saved: unknown): AppState {
  const seed = createInitialState();
  if (!isRecord(saved)) return seed;
  const sadhanaItems = migrateSadhanaItems(saved.sadhanaItems, seed.sadhanaItems);
  const knownIds = new Set(sadhanaItems.map((i) => i.id));
  const todayProgress = migrateTodayProgress(saved.todayProgress);
  return {
    sadhanaItems,
    todayProgress: {
      ...todayProgress,
      completed: todayProgress.completed.filter((id) => knownIds.has(id)),
    },
    completedDates: migrateCompletedDates(saved.completedDates),
    goals: migrateGoals(saved.goals, seed.goals),
    lessons: migrateLessons(saved.lessons, seed.lessons),
    achievements: migrateAchievements(saved.achievements, seed.achievements),
    profile: migrateProfile(saved.profile),
    onboarded: asBool(saved.onboarded, false),
    settings: migrateSettings(saved.settings),
    japa: migrateJapa(saved.japa),
    meditationLog: migrateMeditationLog(saved.meditationLog),
    sevaLog: migrateSevaLog(saved.sevaLog),
    activeQuiz: migrateActiveQuiz(saved.activeQuiz),
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE': {
      // Run saved state through migrate() so corrupt/older payloads fall
      // back to seed defaults per-field instead of crashing screens.
      return migrate(action.state);
    }
    case 'ROLL_OVER': {
      return applyRollover(state, action.today);
    }
    case 'TOGGLE_SADHANA': {
      // Defensive rollover: if the stored day is stale (e.g. the app was
      // left open overnight), reset before applying the toggle.
      const rolled = applyRollover(state, action.today);
      const items = rolled.sadhanaItems.map((i) =>
        i.id === action.id ? { ...i, completed: !i.completed } : i
      );
      return applyChecklistResult(rolled, items, action.today);
    }
    case 'UPDATE_GOAL': {
      const goals = state.goals.map((g) =>
        g.id === action.id
          ? { ...g, currentCount: Math.min(g.currentCount + action.increment, g.targetCount) }
          : g
      );
      return { ...state, goals };
    }
    case 'COMPLETE_LESSON': {
      const hadCompletedBefore = state.lessons.some((l) => l.completed);
      const lessons = state.lessons.map((l) =>
        l.id === action.id ? { ...l, completed: true, score: action.score } : l
      );
      const achievements = hadCompletedBefore
        ? state.achievements
        : unlock(state.achievements, 'a4');
      return { ...state, lessons, achievements };
    }
    case 'UNLOCK_ACHIEVEMENT': {
      return { ...state, achievements: unlock(state.achievements, action.id) };
    }
    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.patch } };
    case 'COMPLETE_ONBOARDING': {
      // Trim the seed checklist to the practices chosen in onboarding.
      // An empty selection keeps all seeds (an empty checklist is never
      // what a first-run user wants).
      const wanted = new Set(action.practiceIds);
      const keepAll = wanted.size === 0;
      const sadhanaItems = keepAll
        ? state.sadhanaItems
        : state.sadhanaItems.filter((i) => wanted.has(i.id));
      const keepIds = new Set(sadhanaItems.map((i) => i.id));
      return {
        ...state,
        onboarded: true,
        sadhanaItems,
        todayProgress: {
          ...state.todayProgress,
          completed: state.todayProgress.completed.filter((id) => keepIds.has(id)),
        },
        profile: {
          ...state.profile,
          displayName: action.displayName,
          ...(action.guideName !== undefined ? { guideName: action.guideName } : null),
        },
      };
    }
    case 'ADD_SADHANA': {
      const item: SadhanaItem = {
        id: `s-${Date.now().toString(36)}`,
        title: action.title,
        ...(action.subtitle !== undefined ? { subtitle: action.subtitle } : null),
        durationMin: action.durationMin,
        completed: false,
        category: action.category,
      };
      return { ...state, sadhanaItems: [...state.sadhanaItems, item] };
    }
    case 'UPDATE_SADHANA': {
      const sadhanaItems = state.sadhanaItems.map((i) =>
        i.id === action.id ? { ...i, ...action.patch } : i
      );
      return { ...state, sadhanaItems };
    }
    case 'REMOVE_SADHANA': {
      return {
        ...state,
        sadhanaItems: state.sadhanaItems.filter((i) => i.id !== action.id),
        todayProgress: {
          ...state.todayProgress,
          completed: state.todayProgress.completed.filter((id) => id !== action.id),
        },
      };
    }
    case 'REORDER_SADHANA': {
      const byId = new Map(state.sadhanaItems.map((i) => [i.id, i]));
      const ordered = action.ids
        .map((id) => byId.get(id))
        .filter((i): i is SadhanaItem => i !== undefined);
      const inIds = new Set(action.ids);
      return {
        ...state,
        sadhanaItems: [...ordered, ...state.sadhanaItems.filter((i) => !inIds.has(i.id))],
      };
    }
    case 'ADD_GOAL': {
      const goal: Goal = {
        id: `g-${Date.now().toString(36)}`,
        title: action.title,
        targetCount: action.targetCount,
        currentCount: 0,
        unit: action.unit,
        assignedBy: action.assignedBy,
        category: action.category,
      };
      return { ...state, goals: [...state.goals, goal] };
    }
    case 'REMOVE_GOAL': {
      return { ...state, goals: state.goals.filter((g) => g.id !== action.id) };
    }
    case 'LOG_JAPA_ROUND': {
      const rolled = applyRollover(state, action.today);
      const base = rolled.japa.date !== action.today
        ? { date: action.today, rounds: 0 }
        : rolled.japa;
      const japa = { date: action.today, rounds: Math.min(base.rounds + 1, JAPA_ROUNDS_TARGET) };
      if (japa.rounds < JAPA_ROUNDS_TARGET) return { ...rolled, japa };
      // Target reached: mark the FIRST japa-category item completed, then
      // run the normal all-done bookkeeping (streak recompute + achievements).
      const firstJapaIdx = rolled.sadhanaItems.findIndex((i) => i.category === 'japa');
      const items = rolled.sadhanaItems.map((item, idx) =>
        idx === firstJapaIdx && !item.completed ? { ...item, completed: true } : item
      );
      return { ...applyChecklistResult(rolled, items, action.today), japa };
    }
    case 'LOG_MEDITATION': {
      const entry: MeditationEntry = { date: action.date, minutes: action.minutes };
      return { ...state, meditationLog: [...state.meditationLog, entry] };
    }
    case 'LOG_SEVA': {
      // One session per calendar day — duplicates would inflate the log,
      // the g3 counter, and the a6 unlock. The UI also disables re-logging,
      // this is the enforcement layer.
      if (state.sevaLog.some((e) => e.date === action.date)) return state;
      const sevaLog: SevaEntry[] = [...state.sevaLog, { date: action.date }];
      const goals = state.goals.map((g) =>
        g.id === 'g3'
          ? { ...g, currentCount: Math.min(g.currentCount + 1, g.targetCount) }
          : g
      );
      const achievements = sevaLog.length >= 5
        ? unlock(state.achievements, 'a6')
        : state.achievements;
      return { ...state, sevaLog, goals, achievements };
    }
    case 'SAVE_QUIZ': {
      return {
        ...state,
        activeQuiz: { lessonId: action.lessonId, qIndex: action.qIndex, correct: action.correct },
      };
    }
    case 'CLEAR_QUIZ': {
      return { ...state, activeQuiz: null };
    }
    case 'UPDATE_SETTINGS': {
      return { ...state, settings: { ...state.settings, ...action.patch } };
    }
    case 'RESET_ALL': {
      // Fresh seed, but the user stays onboarded.
      const fresh = createInitialState();
      return { ...fresh, onboarded: state.onboarded };
    }
    default:
      return state;
  }
}

/** Build a fresh seed state (deep-copied so callers can mutate safely). */
export function createInitialState(): AppState {
  return {
    sadhanaItems: DEFAULT_SADHANA.map((i) => ({ ...i })),
    todayProgress: { date: getTodayISO(), completed: [] },
    completedDates: [],
    goals: DEFAULT_GOALS.map((g) => ({ ...g })),
    lessons: DEFAULT_LESSONS.map((l) => ({
      ...l,
      questions: l.questions.map((q) => ({ ...q, options: [...q.options] })),
    })),
    achievements: DEFAULT_ACHIEVEMENTS.map((a) => ({ ...a })),
    profile: { ...DEFAULT_PROFILE },
    onboarded: false,
    settings: { ...DEFAULT_SETTINGS },
    japa: { date: getTodayISO(), rounds: 0 },
    meditationLog: [],
    sevaLog: [],
    activeQuiz: null,
  };
}

export const initialState: AppState = createInitialState();

// ─── Context ──────────────────────────────────────────────────────────────────

type ContextValue = {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  /** False until saved state (if any) has been loaded from disk. */
  hydrated: boolean;
};

const StoreContext = createContext<ContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [hydrated, setHydrated] = useState(false);
  // True only once the storage read has actually settled (success or
  // failure). The save effect requires it: without this, a timeout-forced
  // launch could persist seed defaults OVER real data still being read.
  const [loadDone, setLoadDone] = useState(false);

  // Load saved state once on launch, migrated then rolled forward to today.
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      // Storage read wedged (rare but real on some Android devices):
      // unblock launch with seeds instead of hanging on the splash forever.
      // `loadDone` stays false so nothing is persisted until the real read
      // settles; if it resolves late, HYDRATE still wins (any edits made in
      // the gap are discarded in favour of disk — the safer direction).
      if (!cancelled) setHydrated(true);
    }, LOAD_TIMEOUT_MS);
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && !cancelled) {
          const saved: unknown = JSON.parse(raw);
          dispatch({ type: 'HYDRATE', state: applyRollover(migrate(saved), getTodayISO()) });
        }
      } catch {
        // Missing or corrupt storage → fall back to seed defaults.
      } finally {
        clearTimeout(timer);
        if (!cancelled) {
          setLoadDone(true);
          setHydrated(true);
        }
      }
    })();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  // The day can change while the app sits in the background — re-check
  // whenever it comes back to the foreground.
  useEffect(() => {
    const sub = RNAppState.addEventListener('change', (s) => {
      if (s === 'active') dispatch({ type: 'ROLL_OVER', today: getTodayISO() });
    });
    return () => sub.remove();
  }, []);

  // Persist every change, but never before the initial load settles
  // (otherwise seed defaults could overwrite saved progress that is still
  // being read — see the timeout race above).
  useEffect(() => {
    if (!hydrated || !loadDone) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {
      // Storage full / unavailable — the app keeps working in-memory.
    });
  }, [state, hydrated, loadDone]);

  if (!hydrated) return null;

  return (
    <StoreContext.Provider value={{ state, dispatch, hydrated }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
