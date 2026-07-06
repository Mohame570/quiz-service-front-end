import { QuizData, QuizStatus } from '@/types/quiz/admin';

export const QUIZ_STATUS_LABEL: Record<QuizStatus, string> = {
  PUBLISHED: 'Published',
  DRAFT: 'Draft',
  CLOSED: 'Closed',
  ARCHIVED: 'Archived',
};

export const QUIZ_STATUS_COLOR: Record<QuizStatus, 'success' | 'warning' | 'destructive' | 'muted-foreground'> = {
  PUBLISHED: 'success',
  DRAFT: 'warning',
  CLOSED: 'destructive',
  ARCHIVED: 'muted-foreground',
};

export const QUIZ_STATUS_PILL_CLASSES: Record<
  (typeof QUIZ_STATUS_COLOR)[QuizStatus],
  { container: string; dot: string; text: string }
> = {
  success: { container: 'bg-success/10', dot: 'bg-success', text: 'text-success' },
  warning: { container: 'bg-warning/10', dot: 'bg-warning', text: 'text-warning' },
  destructive: { container: 'bg-destructive/10', dot: 'bg-destructive', text: 'text-destructive' },
  'muted-foreground': {
    container: 'bg-muted-foreground/10',
    dot: 'bg-muted-foreground',
    text: 'text-muted-foreground',
  },
};

export function getQuizStatusPill(status: QuizStatus) {
  return QUIZ_STATUS_PILL_CLASSES[QUIZ_STATUS_COLOR[status]];
}

export function toApiStatusParam(status: QuizStatus): string {
  return status.toLowerCase();
}

export type ScheduleCandidate = 'future' | 'elapsed' | null;
export type QuizScheduleState = 'SCHEDULED' | 'MISSED_SCHEDULE' | null;

// Pure, date-only classification, no API call. Also used to decide which
// quiz ids need an extra getQuestions({ quizId }) check (only 'elapsed' ones) —
// a DRAFT quiz with both startsAt/endsAt set auto-publishes once startsAt
// passes, unless it has no questions, in which case it's skipped and stays
// DRAFT indefinitely.
export function getDraftScheduleCandidate(
  quiz: Pick<QuizData, 'status' | 'startsAt' | 'endsAt'>
): ScheduleCandidate {
  if (quiz.status !== 'DRAFT' || !quiz.startsAt || !quiz.endsAt) return null;
  return new Date(quiz.startsAt).getTime() > Date.now() ? 'future' : 'elapsed';
}

// hasQuestions is only consulted when candidate === 'elapsed'; if it's true
// or unchecked (undefined), fail open to null rather than risk a false
// MISSED_SCHEDULE warning.
export function getQuizScheduleState(
  candidate: ScheduleCandidate,
  hasQuestions?: boolean
): QuizScheduleState {
  if (candidate === null) return null;
  if (candidate === 'future') return 'SCHEDULED';
  return hasQuestions === false ? 'MISSED_SCHEDULE' : null;
}
