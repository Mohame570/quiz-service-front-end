import type { QuizDto } from '@/types/quiz/student';

export type AttemptStatus = QuizDto['attemptStatus'];

export const ATTEMPT_STATUS_LABELS: Record<AttemptStatus, string> = {
  NOT_STARTED: 'Not started',
  IN_PROGRESS: 'In progress',
  SUBMITTED: 'Completed',
  TIMED_OUT: 'Timed out',
};

export const ATTEMPT_STATUS_STYLES: Record<AttemptStatus, string> = {
  NOT_STARTED: 'bg-primary-50 text-primary-700',
  IN_PROGRESS: 'bg-accent-50 text-accent-700',
  SUBMITTED: 'bg-success/10 text-success',
  TIMED_OUT: 'bg-error/10 text-error',
};
