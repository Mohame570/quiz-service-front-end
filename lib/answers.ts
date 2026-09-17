import type { QuestionType } from '@/types/question/question';

export type SaveAnswerItem =
  | { questionId: string; selectedOptionId: string | null }
  | { questionId: string; textAnswer: string | null };

export function isTextQuestionType(type: QuestionType): boolean {
  return type === 'SHORT_TEXT' || type === 'ESSAY' || type === 'FILL_BLANK' || type === 'CODE_CONTEXT';
}

export function buildAnswerPayload(
  questionId: string,
  type: QuestionType,
  value: string | null,
): SaveAnswerItem {
  if (isTextQuestionType(type)) {
    const trimmed = value?.trim() ?? '';
    return {
      questionId,
      textAnswer: trimmed.length > 0 ? trimmed : null,
    };
  }

  return {
    questionId,
    selectedOptionId: value,
  };
}

export function buildAnswerPayloads(
  questions: Array<{ id: string; type: QuestionType }>,
  answers: Record<string, string | null>,
): SaveAnswerItem[] {
  return questions.map((question) =>
    buildAnswerPayload(question.id, question.type, answers[question.id] ?? null),
  );
}

export function isAnswerFilled(
  type: QuestionType,
  value: string | null | undefined,
): boolean {
  if (isTextQuestionType(type)) {
    return (value?.trim().length ?? 0) > 0;
  }
  return value != null && value.length > 0;
}

export function countAnsweredQuestions(
  questions: Array<{ id: string; type: QuestionType }>,
  answers: Record<string, string | null | undefined>,
): number {
  return questions.filter((question) =>
    isAnswerFilled(question.type, answers[question.id]),
  ).length;
}

export function answersFromAttempt(
  saved: Array<{
    questionId: string;
    selectedOptionId?: string | null;
    textAnswer?: string | null;
  }>,
): Record<string, string | null> {
  const restored: Record<string, string | null> = {};
  for (const answer of saved) {
    restored[answer.questionId] =
      answer.textAnswer ?? answer.selectedOptionId ?? null;
  }
  return restored;
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  MCQ: 'Multiple Choice',
  TRUE_FALSE: 'True / False',
  SHORT_TEXT: 'Short Text',
  ESSAY: 'Essay',
  MULTI_SELECT: 'Multi Select',
  CODE_CONTEXT: 'Code Context',
  FILL_BLANK: 'Fill in the Blank',
};
