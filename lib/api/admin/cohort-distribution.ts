// lib/api/admin/cohort-distribution.ts
import { apiFetch, ApiError } from '@/lib/api/client';
import type {
  AnalyticsFilterParams,
  CohortDistribution,
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

export async function getCohortDistribution(
  params: AnalyticsFilterParams = {},
): Promise<CohortDistribution> {
  return apiFetch<CohortDistribution>(`/api/analytics/cohorts/distribution${buildQuery(params)}`);
}

/**
 * The export endpoint is JWT-guarded like every other admin route, and
 * this app keeps its access token in localStorage rather than a cookie
 * (see lib/api/client.ts) — so a plain <a href> download link would hit
 * the endpoint with no Authorization header and get a 401. Fetch with
 * the token manually instead, then hand the browser a blob to save.
 * Exact same query params as getCohortDistribution() above, so what
 * downloads always matches what's on screen.
 */
export async function downloadCohortStandingsCsv(params: AnalyticsFilterParams = {}): Promise<void> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const response = await fetch(`/api/analytics/cohorts/export.csv${buildQuery(params)}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Export failed' }));
    throw new ApiError(error.message || `HTTP ${response.status}`, response.status, error);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'cohort-standings.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
