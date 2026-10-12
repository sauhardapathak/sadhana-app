import { describe, expect, it } from '@jest/globals';
import {
  addDaysISO,
  formatDate,
  getGreeting,
  getTodayISO,
  parseLocalISODate,
} from '../src/utils/date';
import { getQuoteForDate } from '../src/utils/quotes';
import { QUOTES } from '../src/data/quotes';

describe('getTodayISO', () => {
  it('returns a YYYY-MM-DD string matching the local date', () => {
    const today = getTodayISO();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const d = new Date();
    const expected = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
    expect(today).toBe(expected);
  });
});

describe('addDaysISO', () => {
  it('shifts forward and backward within a month', () => {
    expect(addDaysISO('2026-10-12', 1)).toBe('2026-10-13');
    expect(addDaysISO('2026-10-12', -1)).toBe('2026-10-11');
    expect(addDaysISO('2026-10-12', 0)).toBe('2026-10-12');
  });

  it('crosses month and year boundaries', () => {
    expect(addDaysISO('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDaysISO('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDaysISO('2026-01-01', -1)).toBe('2025-12-31');
    expect(addDaysISO('2025-12-31', 1)).toBe('2026-01-01');
  });

  it('handles leap days', () => {
    expect(addDaysISO('2024-02-28', 1)).toBe('2024-02-29');
    expect(addDaysISO('2024-02-29', 1)).toBe('2024-03-01');
  });
});

describe('parseLocalISODate', () => {
  it('parses YYYY-MM-DD as local midnight (no UTC shift)', () => {
    const d = parseLocalISODate('2026-10-12');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(9);
    expect(d.getDate()).toBe(12);
    expect(d.getHours()).toBe(0);
  });

  it('accepts full ISO datetimes via the date prefix', () => {
    const d = parseLocalISODate('2026-01-05T18:30:00.000Z');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(0);
    expect(d.getDate()).toBe(5);
  });
});

describe('formatDate / getGreeting', () => {
  it('formats a date string into a non-empty human string', () => {
    const out = formatDate('2026-10-12');
    expect(typeof out).toBe('string');
    expect(out.length).toBeGreaterThan(0);
    expect(out).toContain('2026');
  });

  it('returns a known greeting', () => {
    expect(['Good morning', 'Good afternoon', 'Good evening']).toContain(getGreeting());
  });
});

describe('getQuoteForDate', () => {
  it('is deterministic for the same date', () => {
    expect(getQuoteForDate('2026-10-12')).toBe(getQuoteForDate('2026-10-12'));
  });

  it('always returns a member of QUOTES (bounds-safe)', () => {
    const dates = ['2026-10-12', '2025-01-01', '2030-12-31', '2000-02-29', 'not-a-date', ''];
    for (const d of dates) {
      const q = getQuoteForDate(d);
      expect(QUOTES).toContainEqual(q);
      expect(typeof q.text).toBe('string');
      expect(typeof q.source).toBe('string');
    }
  });

  it('picks index via sum-of-char-codes modulo length', () => {
    const iso = '2026-10-12';
    let sum = 0;
    for (let i = 0; i < iso.length; i++) sum += iso.charCodeAt(i);
    expect(getQuoteForDate(iso)).toBe(QUOTES[sum % QUOTES.length]);
  });
});
