import type { QuestionType } from '@/types/question/question';

export type SaveAnswerItem =
  | { questionId: string; selectedOptionId: string | null }
  | { questionId: string; selectedOptionIds: string[] }
  | { questionId: string; textAnswer: string | null };

export function isTextQuestionType(type: QuestionType): boolean {
  return type === 'SHORT_TEXT' || type === 'ESSAY';
}

export function isMultiSelectType(type: QuestionType): boolean {
  return type === 'MULTI_SELECT';
}

export function buildAnswerPayload(
  questionId: string,
  type: QuestionType,
  value: string | string[] | null,
): SaveAnswerItem {
  if (isTextQuestionType(type)) {
    const trimmed = (value as string | null)?.trim() ?? '';
    return {
      questionId,
      textAnswer: trimmed.length > 0 ? trimmed : null,
    };
  }

  if (isMultiSelectType(type)) {
    const arr = Array.isArray(value) ? value : [];
    return {
      questionId,
      selectedOptionIds: arr,
    };
  }

  return {
    questionId,
    selectedOptionId: value as string | null,
  };
}

export function buildAnswerPayloads(
  questions: Array<{ id: string; type: QuestionType }>,
  answers: Record<string, string | string[] | null>,
): SaveAnswerItem[] {
  return questions.map((question) =>
    buildAnswerPayload(question.id, question.type, answers[question.id] ?? null),
  );
}

export function isAnswerFilled(
  type: QuestionType,
  value: string | string[] | null | undefined,
): boolean {
  if (isTextQuestionType(type)) {
    return ((value as string)?.trim().length ?? 0) > 0;
  }
  if (isMultiSelectType(type)) {
    return Array.isArray(value) && value.length > 0;
  }
  return value != null && (value as string).length > 0;
}

export function countAnsweredQuestions(
  questions: Array<{ id: string; type: QuestionType }>,
  answers: Record<string, string | string[] | null | undefined>,
): number {
  return questions.filter((question) =>
    isAnswerFilled(question.type, answers[question.id]),
  ).length;
}

export function answersFromAttempt(
  saved: Array<{
    questionId: string;
    selectedOptionId?: string | null;
    selectedOptionIds?: string[] | null;
    textAnswer?: string | null;
  }>,
): Record<string, string | string[] | null> {
  const restored: Record<string, string | string[] | null> = {};
 for (const answer of saved) {
    const ids = (answer as any).selectedOptionIds;
    if (Array.isArray(ids) && ids.length > 0) {
      restored[answer.questionId] = ids;
    } else {
      restored[answer.questionId] =
        answer.textAnswer ?? answer.selectedOptionId ?? null;
    }
  }
  return restored;
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  MCQ: 'Multiple Choice',
  MULTI_SELECT: 'Multi Select',
  TRUE_FALSE: 'True / False',
  SHORT_TEXT: 'Short Text',
  ESSAY: 'Essay',
};
