// types/analytics/quality-and-distribution.ts
//
// Mirrors backend/src/modules/analytics/dto/question-quality.dto.ts and
// cohort-distribution.dto.ts (docs/analytics-calculations.md).

import type { ScoreDistributionBucket } from '@/types/analytics/analytics';

export interface QuestionQualityMetric {
  questionId: string;
  questionText: string;
  quizId: string;
  quizTitle: string;
  totalFinalizedAttempts: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  pendingGradingCount: number;
  correctRate: number;
  wrongRate: number;
  skippedRate: number;
  pendingGradingRate: number;
  confusionScore: number | null;
}

export interface QuestionQualitySummary {
  totalQuestions: number;
  questions: QuestionQualityMetric[];
}

export interface CohortStudentStanding {
  studentId: string;
  studentName: string;
  cohort: string | null;
  quizId: string;
  quizTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  submittedAt: string;
  rank: number;
  percentile: number;
}

export interface CohortDistribution {
  totalCompletedAttempts: number;
  averagePercentage: number | null;
  medianPercentage: number | null;
  standardDeviationPercentage: number | null;
  scoreDistribution: ScoreDistributionBucket[];
  standings: CohortStudentStanding[];
}

export interface AnalyticsFilterParams {
  quizId?: string;
  cohort?: string;
  tags?: string; // comma-separated
  dateFrom?: string;
  dateTo?: string;
}
