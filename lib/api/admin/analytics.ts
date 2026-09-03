// API client for admin analytics endpoints.
// Backend: AnalyticsController (public — no auth guard)
//   GET /api/analytics → DashboardSummaryDto

import { apiFetch } from '@/lib/api/client';

export interface DashboardSummary {
  totalQuizzes: number;
  totalStudents: number;
  totalAttempts: number;
  averageScore: number;
}

/** Fetch platform-wide analytics summary. */
export async function getAnalyticsSummary(): Promise<DashboardSummary> {
  return apiFetch<DashboardSummary>('/api/analytics');
}
