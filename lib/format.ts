// Shared display-formatting helpers for numeric stats.

/** Placeholder shown when a stat has no meaningful value. */
export const STAT_UNAVAILABLE = '—';

/**
 * Format a numeric stat for compact display.
 * Returns '—' for null/undefined/NaN, '1.2k' for values ≥ 1000,
 * or the plain number as a string otherwise.
 */
export function formatCompactNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return STAT_UNAVAILABLE;
  }
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
}
