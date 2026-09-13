// types/analytics/analytics.ts
//
// Mirrors backend/src/modules/analytics/dto/quiz-metric.dto.ts and
// docs/analytics-contract.md §14.

export type StudentQuizStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'COMPLETED_PENDING_REVIEW'
  | 'PARTICIPATED_NOT_COMPLETED'
  | 'ABSENT';

export interface QuizMetricSummary {
  quizId: string;
  quizTitle: string;
  windowClosed: boolean;
  assignedCount: number;
  participationCount: number;
  completionCount: number;
  absenceCount: number;
  followUpCount: number;
  participationRate: number;
  completionRate: number;
  averageScore: number | null;
}

export type ScoreDistributionRange = '0-20' | '21-40' | '41-60' | '61-80' | '81-100';

export interface ScoreDistributionBucket {
  range: ScoreDistributionRange;
  count: number;
}

export interface DashboardMetrics {
  totalQuizzes: number;
  distinctStudentCount: number;
  assignedCount: number;
  participationCount: number;
  completionCount: number;
  absenceCount: number;
  followUpCount: number;
  participationRate: number;
  completionRate: number;
  averageScore: number | null;
  scoreDistribution: ScoreDistributionBucket[];
  quizzes: QuizMetricSummary[];
}
