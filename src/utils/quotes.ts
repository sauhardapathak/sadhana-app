import { QUOTES, Quote } from '../data/quotes';

/**
 * Deterministically pick a quote for a "YYYY-MM-DD" date string: the index
 * is the sum of the string's char codes modulo the number of quotes, so the
 * same date always yields the same quote without any stored state.
 */
export function getQuoteForDate(isoDate: string): Quote {
  let sum = 0;
  for (let i = 0; i < isoDate.length; i++) {
    sum += isoDate.charCodeAt(i);
  }
  return QUOTES[sum % QUOTES.length];
}
