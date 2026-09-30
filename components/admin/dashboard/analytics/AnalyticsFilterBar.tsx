'use client';

// components/admin/dashboard/analytics/AnalyticsFilterBar.tsx
//
// Shared filter controls for the Question Quality and Cohort
// Distribution views, and the CSV export (which is filtered by these
// same params — see lib/api/admin/cohort-distribution.ts).

import { useState } from 'react';
import type { AnalyticsFilterParams } from '@/types/analytics/quality-and-distribution';

interface AnalyticsFilterBarProps {
  initial?: AnalyticsFilterParams;
  onApply: (filters: AnalyticsFilterParams) => void;
  /// Optional extra action (e.g. "Export CSV") rendered inline with Apply.
  extraAction?: React.ReactNode;
}

const inputClass =
  'rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-foreground-secondary focus:border-primary-500 focus:outline-none';

export default function AnalyticsFilterBar({ initial, onApply, extraAction }: AnalyticsFilterBarProps) {
  const [cohort, setCohort] = useState(initial?.cohort ?? '');
  const [tags, setTags] = useState(initial?.tags ?? '');
  const [dateFrom, setDateFrom] = useState(initial?.dateFrom ?? '');
  const [dateTo, setDateTo] = useState(initial?.dateTo ?? '');

  function apply() {
    onApply({
      cohort: cohort.trim() || undefined,
      tags: tags.trim() || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
  }

  function clear() {
    setCohort('');
    setTags('');
    setDateFrom('');
    setDateTo('');
    onApply({});
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex flex-col gap-1">
        <label htmlFor="filter-cohort" className="text-xs font-medium text-foreground-secondary">
          Cohort
        </label>
        <input
          id="filter-cohort"
          type="text"
          placeholder="e.g. 2026-A"
          value={cohort}
          onChange={(e) => setCohort(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="filter-tags" className="text-xs font-medium text-foreground-secondary">
          Tags (comma-separated)
        </label>
        <input
          id="filter-tags"
          type="text"
          placeholder="e.g. midterm,algebra"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="filter-date-from" className="text-xs font-medium text-foreground-secondary">
          From
        </label>
        <input
          id="filter-date-from"
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="filter-date-to" className="text-xs font-medium text-foreground-secondary">
          To
        </label>
        <input
          id="filter-date-to"
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={apply}
          className="rounded-lg bg-primary-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          Apply filters
        </button>
        <button
          type="button"
          onClick={clear}
          className="rounded-lg border border-border px-4 py-1.5 text-sm font-medium text-foreground-secondary hover:bg-muted"
        >
          Clear
        </button>
        {extraAction}
      </div>
    </div>
  );
}
