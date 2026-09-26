import type { AttemptAnswerDto } from '@/types/attempt/attempt';
import type { QuizDto } from '@/types/quiz/student';

export type AnswerDisplayStatus = 'correct' | 'incorrect' | 'pending' | 'skipped';

export function getAnswerDisplayStatus(
  answer: AttemptAnswerDto,
): AnswerDisplayStatus {
  const hasText = (answer.textAnswer?.trim().length ?? 0) > 0;
  const hasChoice =
    answer.selectedOptionId != null && answer.selectedOptionId !== '';
  const selectedIds = answer.selectedOptionIds;
  const hasMultiChoice = Array.isArray(selectedIds) && selectedIds.length > 0;
  if (!hasText && !hasChoice && !hasMultiChoice) return 'skipped';

  if (hasText) {
    if (answer.isCorrect === true) return 'correct';
    if (answer.isCorrect === false) return 'incorrect';
    return 'pending';
  }

  if (answer.isCorrect === true) return 'correct';
  if (answer.isCorrect === false) return 'incorrect';
  return 'pending';
}

export function isCompletedQuiz(
  status: QuizDto['attemptStatus'],
): boolean {
  return status === 'SUBMITTED' || status === 'TIMED_OUT';
}

export function hasTextAnswers(answers: AttemptAnswerDto[]): boolean {
  return answers.some((a) => (a.textAnswer?.trim().length ?? 0) > 0);
}

export function hasPendingManualGrading(answers: AttemptAnswerDto[]): boolean {
  return answers.some(
    (a) => a.isCorrect === null && (a.textAnswer?.trim().length ?? 0) > 0,
  );
}

export const ANSWER_STATUS_LABELS: Record<AnswerDisplayStatus, string> = {
  correct: 'Correct',
  incorrect: 'Incorrect',
  pending: 'Pending grading',
  skipped: 'Skipped',
};

export const ANSWER_STATUS_STYLES: Record<
  AnswerDisplayStatus,
  { row: string; label: string }
> = {
  correct: {
    row: 'border-success/30 bg-success/5',
    label: 'text-success',
  },
  incorrect: {
    row: 'border-error/30 bg-error/5',
    label: 'text-error',
  },
  pending: {
    row: 'border-amber-200 bg-amber-50',
    label: 'text-amber-700',
  },
  skipped: {
    row: 'border-border bg-surface',
    label: 'text-muted-foreground',
  },
};
