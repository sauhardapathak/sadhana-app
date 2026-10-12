import { describe, expect, it } from '@jest/globals';
import {
  createInitialState,
  migrate,
  recomputeStreak,
  reducer,
  JAPA_ROUNDS_TARGET,
  STORAGE_KEY,
  AppState,
} from '../src/store/sadhanaStore';

const DAY = '2026-10-12';
const YESTERDAY = '2026-10-11';

function fresh(): AppState {
  return createInitialState();
}

/** Toggle every item done for DAY. */
function completeAll(state: AppState, day: string = DAY): AppState {
  let s = state;
  for (const item of state.sadhanaItems) {
    s = reducer(s, { type: 'TOGGLE_SADHANA', id: item.id, today: day });
  }
  return s;
}

function unlockedIds(state: AppState): string[] {
  return state.achievements.filter((a) => a.unlockedAt).map((a) => a.id);
}

describe('storage contract', () => {
  it('uses the v2 storage key and 108-round japa target', () => {
    expect(STORAGE_KEY).toBe('sadhana:state:v2');
    expect(JAPA_ROUNDS_TARGET).toBe(108);
  });

  it('seeds the new fields with defaults', () => {
    const s = fresh();
    expect(s.onboarded).toBe(false);
    expect(s.settings).toEqual({ reminderEnabled: false, reminderTime: '06:00' });
    expect(s.japa.rounds).toBe(0);
    expect(typeof s.japa.date).toBe('string');
    expect(s.meditationLog).toEqual([]);
    expect(s.sevaLog).toEqual([]);
    expect(s.activeQuiz).toBeNull();
  });
});

describe('recomputeStreak', () => {
  it('returns zeros for empty history', () => {
    expect(recomputeStreak([], DAY)).toEqual({
      currentStreak: 0,
      longestStreak: 0,
      totalDaysCompleted: 0,
    });
  });

  it('counts a 3-day run', () => {
    const dates = ['2026-10-10', '2026-10-11', '2026-10-12'];
    expect(recomputeStreak(dates, DAY)).toEqual({
      currentStreak: 3,
      longestStreak: 3,
      totalDaysCompleted: 3,
    });
  });

  it('keeps the streak alive when today is missing but yesterday is done', () => {
    expect(
      recomputeStreak(['2026-10-10', '2026-10-11'], DAY)
    ).toEqual({ currentStreak: 2, longestStreak: 2, totalDaysCompleted: 2 });
  });

  it('breaks current but keeps longest after a fully missed day', () => {
    expect(
      recomputeStreak(['2026-10-05', '2026-10-06', '2026-10-07'], DAY)
    ).toEqual({ currentStreak: 0, longestStreak: 3, totalDaysCompleted: 3 });
  });

  it('handles unordered input with duplicates', () => {
    const dates = ['2026-10-12', '2026-10-10', '2026-10-11', '2026-10-10', '2026-10-12'];
    expect(recomputeStreak(dates, DAY)).toEqual({
      currentStreak: 3,
      longestStreak: 3,
      totalDaysCompleted: 3,
    });
  });
});

describe('TOGGLE_SADHANA', () => {
  it('appending the last check completes today and bumps stats', () => {
    const done = completeAll(fresh());
    expect(done.completedDates).toContain(DAY);
    expect(done.profile.currentStreak).toBe(1);
    expect(done.profile.totalDaysCompleted).toBe(1);
    expect(done.todayProgress).toEqual({
      date: DAY,
      completed: done.sadhanaItems.map((i) => i.id),
    });
  });

  it('unchecking an item removes today from history', () => {
    const done = completeAll(fresh());
    const undone = reducer(done, {
      type: 'TOGGLE_SADHANA',
      id: done.sadhanaItems[0].id,
      today: DAY,
    });
    expect(undone.completedDates).not.toContain(DAY);
    expect(undone.profile.currentStreak).toBe(0);
    expect(undone.profile.totalDaysCompleted).toBe(0);
  });

  it('unlocks a1 on the first full day', () => {
    const done = completeAll(fresh());
    expect(unlockedIds(done)).toContain('a1');
  });
});

describe('COMPLETE_LESSON', () => {
  it('unlocks a4 on the first completed lesson', () => {
    const s = reducer(fresh(), { type: 'COMPLETE_LESSON', id: 'l1', score: 75 });
    expect(s.lessons.find((l) => l.id === 'l1')?.completed).toBe(true);
    expect(s.lessons.find((l) => l.id === 'l1')?.score).toBe(75);
    expect(unlockedIds(s)).toContain('a4');
  });
});

describe('LOG_SEVA', () => {
  it('unlocks a6 after 5 logs and bumps g3 (capped)', () => {
    let s = fresh();
    const days = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05'];
    for (const date of days) {
      s = reducer(s, { type: 'LOG_SEVA', date });
    }
    expect(s.sevaLog).toHaveLength(5);
    expect(s.goals.find((g) => g.id === 'g3')?.currentCount).toBe(5);
    expect(unlockedIds(s)).toContain('a6');
  });

  it('ignores a duplicate log for the same day', () => {
    let s = reducer(fresh(), { type: 'LOG_SEVA', date: DAY });
    s = reducer(s, { type: 'LOG_SEVA', date: DAY });
    expect(s.sevaLog).toHaveLength(1);
    expect(s.goals.find((g) => g.id === 'g3')?.currentCount).toBe(1);
  });

  it('caps g3 at its targetCount', () => {
    let s = fresh();
    for (let i = 0; i < 15; i++) {
      s = reducer(s, { type: 'LOG_SEVA', date: `2026-09-${String(i + 1).padStart(2, '0')}` });
    }
    expect(s.goals.find((g) => g.id === 'g3')?.currentCount).toBe(10);
  });
});

describe('LOG_JAPA_ROUND', () => {
  it('counts up and completes the japa item at 108 rounds', () => {
    let s = fresh();
    for (let i = 0; i < JAPA_ROUNDS_TARGET; i++) {
      s = reducer(s, { type: 'LOG_JAPA_ROUND', today: DAY });
    }
    expect(s.japa).toEqual({ date: DAY, rounds: 108 });
    const japaItem = s.sadhanaItems.find((i) => i.category === 'japa');
    expect(japaItem?.completed).toBe(true);
    expect(s.todayProgress.completed).toContain(japaItem?.id);
  });

  it('resets the counter when the day changes', () => {
    let s = reducer(fresh(), { type: 'LOG_JAPA_ROUND', today: YESTERDAY });
    expect(s.japa).toEqual({ date: YESTERDAY, rounds: 1 });
    s = reducer(s, { type: 'LOG_JAPA_ROUND', today: DAY });
    expect(s.japa).toEqual({ date: DAY, rounds: 1 });
  });

  it('caps rounds at the target on extra taps', () => {
    let s = fresh();
    for (let i = 0; i < JAPA_ROUNDS_TARGET + 5; i++) {
      s = reducer(s, { type: 'LOG_JAPA_ROUND', today: DAY });
    }
    expect(s.japa).toEqual({ date: DAY, rounds: 108 });
  });
});

describe('ROLL_OVER', () => {
  it('resets the checklist but preserves history', () => {
    const done = completeAll(fresh(), YESTERDAY);
    expect(done.completedDates).toContain(YESTERDAY);
    const rolled = reducer(done, { type: 'ROLL_OVER', today: DAY });
    expect(rolled.sadhanaItems.every((i) => !i.completed)).toBe(true);
    expect(rolled.todayProgress).toEqual({ date: DAY, completed: [] });
    expect(rolled.completedDates).toContain(YESTERDAY);
    // Yesterday done → streak still alive after rollover.
    expect(rolled.profile.currentStreak).toBe(1);
  });
});

describe('other new actions', () => {
  it('COMPLETE_ONBOARDING sets profile fields and onboarded', () => {
    const s = reducer(fresh(), {
      type: 'COMPLETE_ONBOARDING',
      displayName: 'Arjun',
      guideName: 'Mataji',
      practiceIds: ['s1', 's2'],
    });
    expect(s.onboarded).toBe(true);
    expect(s.profile.displayName).toBe('Arjun');
    expect(s.profile.guideName).toBe('Mataji');
  });

  it('COMPLETE_ONBOARDING trims the checklist to the chosen practices', () => {
    const s = reducer(fresh(), {
      type: 'COMPLETE_ONBOARDING',
      displayName: 'Arjun',
      practiceIds: ['s1', 's3'],
    });
    expect(s.sadhanaItems.map((i) => i.id)).toEqual(['s1', 's3']);
  });

  it('COMPLETE_ONBOARDING with an empty selection keeps all seeds', () => {
    const s = reducer(fresh(), {
      type: 'COMPLETE_ONBOARDING',
      displayName: 'Arjun',
      practiceIds: [],
    });
    expect(s.sadhanaItems).toHaveLength(4);
  });

  it('ADD/UPDATE/REMOVE/REORDER sadhana items', () => {
    let s = reducer(fresh(), {
      type: 'ADD_SADHANA',
      title: 'Evening Aarti',
      durationMin: 10,
      category: 'puja',
    });
    const added = s.sadhanaItems[s.sadhanaItems.length - 1];
    expect(added.id).toMatch(/^s-[0-9a-z]+$/);
    expect(added.completed).toBe(false);

    s = reducer(s, {
      type: 'UPDATE_SADHANA',
      id: added.id,
      patch: { title: 'Evening Ārati', durationMin: 15 },
    });
    expect(s.sadhanaItems.find((i) => i.id === added.id)?.title).toBe('Evening Ārati');

    const ids = s.sadhanaItems.map((i) => i.id).reverse();
    s = reducer(s, { type: 'REORDER_SADHANA', ids });
    expect(s.sadhanaItems.map((i) => i.id)).toEqual(ids);

    s = reducer(s, { type: 'REMOVE_SADHANA', id: added.id });
    expect(s.sadhanaItems.find((i) => i.id === added.id)).toBeUndefined();
  });

  it('ADD_GOAL / REMOVE_GOAL round-trip', () => {
    let s = reducer(fresh(), {
      type: 'ADD_GOAL',
      title: 'Sit 20 mornings',
      targetCount: 20,
      unit: 'days',
      category: 'meditation',
      assignedBy: 'self',
    });
    const added = s.goals[s.goals.length - 1];
    expect(added.id).toMatch(/^g-[0-9a-z]+$/);
    expect(added.currentCount).toBe(0);
    s = reducer(s, { type: 'REMOVE_GOAL', id: added.id });
    expect(s.goals.find((g) => g.id === added.id)).toBeUndefined();
  });

  it('LOG_MEDITATION appends entries', () => {
    const s = reducer(fresh(), { type: 'LOG_MEDITATION', date: DAY, minutes: 20 });
    expect(s.meditationLog).toEqual([{ date: DAY, minutes: 20 }]);
  });

  it('SAVE_QUIZ / CLEAR_QUIZ round-trip', () => {
    let s = reducer(fresh(), { type: 'SAVE_QUIZ', lessonId: 'l1', qIndex: 2, correct: 1 });
    expect(s.activeQuiz).toEqual({ lessonId: 'l1', qIndex: 2, correct: 1 });
    s = reducer(s, { type: 'CLEAR_QUIZ' });
    expect(s.activeQuiz).toBeNull();
  });

  it('UPDATE_SETTINGS merges the patch', () => {
    const s = reducer(fresh(), {
      type: 'UPDATE_SETTINGS',
      patch: { reminderEnabled: true, reminderTime: '05:30' },
    });
    expect(s.settings).toEqual({ reminderEnabled: true, reminderTime: '05:30' });
  });

  it('RESET_ALL returns fresh seeds but stays onboarded', () => {
    let s = reducer(fresh(), {
      type: 'COMPLETE_ONBOARDING',
      displayName: 'Arjun',
      practiceIds: [],
    });
    s = completeAll(s);
    s = reducer(s, { type: 'RESET_ALL' });
    expect(s.onboarded).toBe(true);
    expect(s.completedDates).toEqual([]);
    expect(s.sadhanaItems.every((i) => !i.completed)).toBe(true);
    expect(s.profile.currentStreak).toBe(0);
  });
});

describe('migrate()', () => {
  it('returns seed defaults for null / garbage / scalar input', () => {
    for (const bad of [null, undefined, 'garbage', 42, [1, 2, 3]]) {
      const s = migrate(bad);
      expect(s.onboarded).toBe(false);
      expect(s.settings).toEqual({ reminderEnabled: false, reminderTime: '06:00' });
      expect(s.completedDates).toEqual([]);
      expect(s.meditationLog).toEqual([]);
      expect(s.sevaLog).toEqual([]);
      expect(s.activeQuiz).toBeNull();
      expect(s.japa.rounds).toBe(0);
      expect(s.sadhanaItems.length).toBeGreaterThan(0);
    }
  });

  it('falls back per-field on partial input', () => {
    const s = migrate({ onboarded: true });
    expect(s.onboarded).toBe(true);
    expect(s.completedDates).toEqual([]);
    expect(s.sadhanaItems.length).toBeGreaterThan(0);
    expect(s.profile.displayName).toBe('Devotee');
  });

  it('repairs corrupt fields while keeping valid ones', () => {
    const s = migrate({
      completedDates: ['2026-10-12', 'not-a-date', 42, '2026-10-12'],
      profile: { displayName: 'Meera', currentStreak: 'lots', longestStreak: -3 },
      settings: { reminderEnabled: 'yes', reminderTime: '25:99' },
      japa: { date: 'bogus', rounds: -5 },
      activeQuiz: { lessonId: 'l1' },
    });
    expect(s.completedDates).toEqual(['2026-10-12']);
    expect(s.profile.displayName).toBe('Meera');
    expect(s.profile.currentStreak).toBe(0);
    expect(s.profile.longestStreak).toBe(0);
    expect(s.settings).toEqual({ reminderEnabled: false, reminderTime: '06:00' });
    expect(s.japa.rounds).toBe(0);
    expect(s.activeQuiz).toBeNull();
  });

  it('accepts v1-shaped payloads (old fields kept, new fields defaulted)', () => {
    const v1 = {
      sadhanaItems: [
        { id: 's1', title: 'Puja', durationMin: 20, completed: true, category: 'puja' },
      ],
      todayProgress: { date: '2026-10-11', completed: ['s1'] },
      completedDates: ['2026-10-09', '2026-10-10', '2026-10-11'],
      goals: [],
      lessons: [],
      achievements: [],
      profile: {
        id: 'u1',
        displayName: 'Devotee',
        joinedAt: '2026-01-01T00:00:00.000Z',
        currentStreak: 3,
        longestStreak: 5,
        totalDaysCompleted: 7,
      },
    };
    const s = migrate(v1);
    expect(s.completedDates).toHaveLength(3);
    expect(s.profile.currentStreak).toBe(3);
    expect(s.sadhanaItems[0].completed).toBe(true);
    expect(s.onboarded).toBe(false);
    expect(s.settings).toEqual({ reminderEnabled: false, reminderTime: '06:00' });
    expect(s.japa.rounds).toBe(0);
    expect(s.meditationLog).toEqual([]);
    expect(s.sevaLog).toEqual([]);
    expect(s.activeQuiz).toBeNull();
  });

  it('is idempotent', () => {
    const once = migrate({
      completedDates: ['2026-10-12', 'junk'],
      profile: { displayName: '', currentStreak: 2 },
    });
    expect(migrate(once)).toEqual(once);
  });
});
