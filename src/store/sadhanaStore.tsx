/**
 * Sādhana Store — lightweight in-memory state with AsyncStorage persistence.
 * Uses React Context + useReducer so it's easy to swap for Zustand/Redux later.
 */
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { SadhanaItem, DailyProgress, Goal, Lesson, Achievement, UserProfile } from '../types';
import { getTodayISO } from '../utils/date';

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
    currentCount: 6,
    unit: 'days',
    assignedBy: 'Guruji',
    category: 'japa',
  },
  {
    id: 'g2',
    title: 'Read all 18 chapters of Gītā',
    targetCount: 18,
    currentCount: 4,
    unit: 'chapters',
    assignedBy: 'Guruji',
    category: 'reading',
  },
  {
    id: 'g3',
    title: 'Attend 10 seva sessions',
    targetCount: 10,
    currentCount: 2,
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
    unlockedAt: new Date().toISOString(),
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
  joinedAt: new Date(Date.now() - 6 * 86_400_000).toISOString(),
  currentStreak: 6,
  longestStreak: 6,
  totalDaysCompleted: 6,
};

// ─── State & Reducer ──────────────────────────────────────────────────────────

export type AppState = {
  sadhanaItems: SadhanaItem[];
  todayProgress: DailyProgress;
  goals: Goal[];
  lessons: Lesson[];
  achievements: Achievement[];
  profile: UserProfile;
};

type Action =
  | { type: 'TOGGLE_SADHANA'; id: string }
  | { type: 'UPDATE_GOAL'; id: string; increment: number }
  | { type: 'COMPLETE_LESSON'; id: string; score: number }
  | { type: 'UNLOCK_ACHIEVEMENT'; id: string }
  | { type: 'UPDATE_PROFILE'; patch: Partial<UserProfile> };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'TOGGLE_SADHANA': {
      const items = state.sadhanaItems.map((i) =>
        i.id === action.id ? { ...i, completed: !i.completed } : i
      );
      const completed = items.filter((i) => i.completed).map((i) => i.id);
      return {
        ...state,
        sadhanaItems: items,
        todayProgress: { ...state.todayProgress, completed },
      };
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
      const lessons = state.lessons.map((l) =>
        l.id === action.id ? { ...l, completed: true, score: action.score } : l
      );
      return { ...state, lessons };
    }
    case 'UNLOCK_ACHIEVEMENT': {
      const achievements = state.achievements.map((a) =>
        a.id === action.id && !a.unlockedAt
          ? { ...a, unlockedAt: new Date().toISOString() }
          : a
      );
      return { ...state, achievements };
    }
    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.patch } };
    default:
      return state;
  }
}

const initialState: AppState = {
  sadhanaItems: DEFAULT_SADHANA,
  todayProgress: { date: getTodayISO(), completed: [], streakDay: 6 },
  goals: DEFAULT_GOALS,
  lessons: DEFAULT_LESSONS,
  achievements: DEFAULT_ACHIEVEMENTS,
  profile: DEFAULT_PROFILE,
};

// ─── Context ──────────────────────────────────────────────────────────────────

type ContextValue = {
  state: AppState;
  dispatch: React.Dispatch<Action>;
};

const StoreContext = createContext<ContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
