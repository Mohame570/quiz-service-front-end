// lib/api/admin/follow-up.ts
//
// API client for the Sprint 2 learner follow-up queue.
// Backend: GET /api/follow-up, GET /api/follow-up/quizzes/:quizId (ADMIN only)

import { apiFetch } from '@/lib/api/client';
import type { FollowUpSummary } from '@/types/follow-up/follow-up';

export async function getFollowUpQueue(): Promise<FollowUpSummary> {
  return apiFetch<FollowUpSummary>('/api/follow-up');
}

export async function getFollowUpQueueForQuiz(quizId: string): Promise<FollowUpSummary> {
  return apiFetch<FollowUpSummary>(`/api/follow-up/quizzes/${quizId}`);
}
