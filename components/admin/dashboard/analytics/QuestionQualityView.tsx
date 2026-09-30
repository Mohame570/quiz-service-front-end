'use client';

// components/admin/dashboard/analytics/QuestionQualityView.tsx

import { useEffect, useState } from 'react';
import { getQuestionQuality } from '@/lib/api/admin/question-quality';
import { ApiError } from '@/lib/api/client';
import type {
  AnalyticsFilterParams,
  QuestionQualitySummary,
} from '@/types/analytics/quality-and-distribution';
import LoadingPanel from '@/components/shared/LoadingPanel';
import EmptyPanel from '@/components/shared/EmptyPanel';
import AnalyticsFilterBar from './AnalyticsFilterBar';
import QuestionQualityTable from './QuestionQualityTable';

export default function QuestionQualityView() {
  const [filters, setFilters] = useState<AnalyticsFilterParams>({});
  const [summary, setSummary] = useState<QuestionQualitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchSummary() {
      setLoading(true);
      setError(null);
      try {
        const data = await getQuestionQuality(filters);
        if (!cancelled) setSummary(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Could not load question quality data.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSummary();
    return () => {
      cancelled = true;
    };
  }, [filters]);

  return (
    <div className="flex flex-col gap-4">
      <AnalyticsFilterBar onApply={setFilters} />

      {loading && <LoadingPanel message="Loading question quality…" />}

      {!loading && (error || !summary) && (
        <EmptyPanel
          title="Couldn't load question quality"
          description={error ?? 'Something went wrong.'}
        />
      )}

      {!loading && summary && summary.totalQuestions === 0 && (
        <EmptyPanel
          title="No data for these filters"
          description="No finalized attempts match the current filters yet — adjust or clear them, or check back once students have submitted."
        />
      )}

      {!loading && summary && summary.totalQuestions > 0 && (
        <QuestionQualityTable questions={summary.questions} />
      )}
    </div>
  );
}
