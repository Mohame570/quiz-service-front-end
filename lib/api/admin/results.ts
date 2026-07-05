// lib/api/admin/results.ts
//
// API client for admin quiz results.
// Backend: GET /api/results?quizId={quizId} (ADMIN only, 403 otherwise)

import { apiFetch } from '@/lib/api/client';
import type { Result } from '@/types/quiz/result';

export async function getQuizResults(quizId: string): Promise<Result[]> {
  return apiFetch<Result[]>(`/api/results?quizId=${quizId}`);
}
