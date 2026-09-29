// types/follow-up/follow-up.ts
//
// Mirrors backend/src/modules/follow-up/dto/follow-up.dto.ts and
// docs/analytics-contract.md §15.

import type { StudentQuizStatus } from '@/types/analytics/analytics';

export type FollowUpCategory =
  | 'PENDING_ESSAY_REVIEW'
  | 'AT_RISK_LOW_SCORE'
  | 'STALLED_IN_PROGRESS'
  | 'ABANDONED_NOT_COMPLETED'
  | 'ABSENT_NO_SHOW'
  | 'NOT_STARTED_CLOSING_SOON';

export interface FollowUpEntry {
  studentId: string;
  studentName: string;
  quizId: string;
  quizTitle: string;
  category: FollowUpCategory;
  reason: string;
  recommendedAction: string;
  status: StudentQuizStatus;
  score: number | null;
  maxScore: number | null;
  percentage: number | null;
  pendingEssayCount: number;
  attemptId: string | null;
}

export interface FollowUpCategoryGroup {
  category: FollowUpCategory;
  label: string;
  description: string;
  count: number;
  entries: FollowUpEntry[];
}

export interface FollowUpSummary {
  totalFollowUps: number;
  categories: FollowUpCategoryGroup[];
}
