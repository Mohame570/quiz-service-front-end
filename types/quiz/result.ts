export type GradingStatus = 'COMPLETE' | 'PENDING_MANUAL' | string;

export interface Result {
  id: string;
  attemptId: string;
  studentId: string;
  quizId: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean | null;
  gradingStatus: GradingStatus;
  pendingEssayCount: number;
  gradedAt: string;
  createdAt: string;
  updatedAt: string;
}
