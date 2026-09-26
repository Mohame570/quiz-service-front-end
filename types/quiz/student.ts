// Student-facing DTOs for quiz endpoints

export type QuizDto = {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number | null;
  passingScore: number | null;
  maxAttempts: number | null;
  startsAt: string | null;
  endsAt: string | null;
  questionCount: number;
  attemptStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'TIMED_OUT';
  attemptId: string | null;
};

export type QuizInstructionsDto = QuizDto & {
  canStart: boolean;
  reasonIfBlocked: string | null;
};
