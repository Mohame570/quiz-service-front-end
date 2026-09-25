// lib/api/admin/question-quality.ts
import { apiFetch } from '@/lib/api/client';
import type {
  AnalyticsFilterParams,
  QuestionQualitySummary,
} from '@/types/analytics/quality-and-distribution';

function buildQuery(params: AnalyticsFilterParams): string {
  const search = new URLSearchParams();
  if (params.quizId) search.set('quizId', params.quizId);
  if (params.cohort) search.set('cohort', params.cohort);
  if (params.tags) search.set('tags', params.tags);
  if (params.dateFrom) search.set('dateFrom', params.dateFrom);
  if (params.dateTo) search.set('dateTo', params.dateTo);
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export async function getQuestionQuality(
  params: AnalyticsFilterParams = {},
): Promise<QuestionQualitySummary> {
  return apiFetch<QuestionQualitySummary>(`/api/analytics/questions/quality${buildQuery(params)}`);
}
