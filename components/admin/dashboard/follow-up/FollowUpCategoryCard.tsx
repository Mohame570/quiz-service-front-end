'use client';

// components/admin/dashboard/follow-up/FollowUpCategoryCard.tsx

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { FollowUpCategoryGroup } from '@/types/follow-up/follow-up';

const CATEGORY_ACCENT: Record<string, string> = {
  PENDING_ESSAY_REVIEW: 'border-l-amber-400',
  AT_RISK_LOW_SCORE: 'border-l-red-400',
  STALLED_IN_PROGRESS: 'border-l-orange-400',
  ABANDONED_NOT_COMPLETED: 'border-l-purple-400',
  ABSENT_NO_SHOW: 'border-l-gray-400',
  NOT_STARTED_CLOSING_SOON: 'border-l-blue-400',
};

export default function FollowUpCategoryCard({ group }: { group: FollowUpCategoryGroup }) {
  const [open, setOpen] = useState(group.count > 0);
  const accent = CATEGORY_ACCENT[group.category] ?? 'border-l-primary-400';

  return (
    <div className={`overflow-hidden rounded-2xl border border-border border-l-4 bg-surface ${accent}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{group.label}</h3>
            <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-bold text-primary-800">
              {group.count}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-foreground-secondary">{group.description}</p>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-foreground-secondary transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="border-t border-border">
          {group.count === 0 ? (
            <p className="px-5 py-4 text-sm text-foreground-secondary">No learners in this category right now.</p>
          ) : (
            <ul className="divide-y divide-border">
              {group.entries.map((entry) => (
                <li key={`${entry.quizId}-${entry.studentId}`} className="px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{entry.studentName}</p>
                    <span className="text-xs text-foreground-secondary">{entry.quizTitle}</span>
                  </div>
                  <p className="mt-1 text-sm text-foreground-secondary">{entry.reason}</p>
                  <p className="mt-2 text-sm font-medium text-primary-700">→ {entry.recommendedAction}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
