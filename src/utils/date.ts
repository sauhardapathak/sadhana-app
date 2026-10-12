/**
 * Date helpers — all day-granularity math uses the device's LOCAL calendar day.
 *
 * NOTE: `new Date().toISOString()` returns the UTC date, which is the previous
 * day for timezones ahead of UTC (e.g. IST is UTC+5:30, so 00:00–05:29 local
 * maps to "yesterday" in UTC). Streaks and day rollover must use local getters.
 */

/** Today's date as "YYYY-MM-DD" in the device's local timezone. */
export function getTodayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Parse a "YYYY-MM-DD" string as LOCAL midnight (not UTC midnight, which is
 * what `new Date('YYYY-MM-DD')` produces). Also accepts full ISO datetimes
 * (e.g. stored `joinedAt` / `unlockedAt` timestamps) by reading the date part.
 */
export function parseLocalISODate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Shift a "YYYY-MM-DD" date by `deltaDays` calendar days, DST-safe
 * (operates on local-midnight Date objects, never on epoch arithmetic).
 */
export function addDaysISO(iso: string, deltaDays: number): string {
  const d = parseLocalISODate(iso);
  d.setDate(d.getDate() + deltaDays);
  return toISODate(d);
}

export function formatDate(iso: string): string {
  const d = parseLocalISODate(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
