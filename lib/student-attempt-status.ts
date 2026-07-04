import type { QuizDto } from '@/types/quiz/student';

export type AttemptStatus = QuizDto['attemptStatus'];

export const ATTEMPT_STATUS_LABELS: Record<AttemptStatus, string> = {
  NOT_STARTED: 'Not started',
  IN_PROGRESS: 'In progress',
  SUBMITTED: 'Completed',
  TIMED_OUT: 'Timed out',
};

export const ATTEMPT_STATUS_STYLES: Record<AttemptStatus, string> = {
  NOT_STARTED: 'bg-muted/15 text-foreground-secondary',
  IN_PROGRESS: 'bg-info/10 text-info',
  SUBMITTED: 'bg-success/10 text-success',
  TIMED_OUT: 'bg-error/10 text-error',
};
