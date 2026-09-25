// lib/api/admin/analytics.ts
//
// API client for the analytics endpoints. getAnalyticsSummary() below
// calls the original Sprint 1 org-wide summary (GET /api/analytics);
// getDashboardMetrics() etc. call the Sprint 2 live dashboard
// (GET /api/analytics/dashboard). Both endpoints still exist
// server-side — kept side by side here since different pages use each.

import { apiFetch } from '@/lib/api/client';
import type { DashboardMetrics, QuizMetricSummary, StudentQuizStatus } from '@/types/analytics/analytics';

export interface DashboardSummary {
  totalQuizzes: number;
  totalStudents: number;
  totalAttempts: number;
  averageScore: number;
}

export async function getAnalyticsSummary(): Promise<DashboardSummary> {
  return apiFetch<DashboardSummary>('/api/analytics');
}

export interface StudentQuizMetric {
  studentId: string;
  studentName: string;
  quizId: string;
  status: StudentQuizStatus;
  score: number | null;
  maxScore: number | null;
  percentage: number | null;
  attemptId: string | null;
  startedAt: string | null;
  submittedAt: string | null;
  followUpRequired: boolean;
  pendingEssayCount: number;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  return apiFetch<DashboardMetrics>('/api/analytics/dashboard');
}

export async function getQuizMetricSummary(quizId: string): Promise<QuizMetricSummary> {
  return apiFetch<QuizMetricSummary>(`/api/analytics/quizzes/${quizId}/metrics`);
}

export async function getStudentQuizMetrics(quizId: string): Promise<StudentQuizMetric[]> {
  return apiFetch<StudentQuizMetric[]>(`/api/analytics/quizzes/${quizId}/student-metrics`);
}
