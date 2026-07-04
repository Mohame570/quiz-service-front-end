import { apiFetch } from '@/lib/api/client';
import type { QuizDto, QuizInstructionsDto } from '@/types/quiz/student';
import type { AcceptInvitationResponse } from '@/types/quiz/invitation';
import type {
  ActiveAttemptResponse,
  AttemptQuestionsResponse,
  AttemptWithAnswersDto,
  SaveAnswersRequest,
  SubmitAttemptRequest,
} from '@/types/attempt/attempt';

export async function getQuizzes(): Promise<QuizDto[]> {
  const response = await apiFetch<{ items: QuizDto[] }>('/api/student/quizzes');
  return response.items;
}

export async function getQuiz(id: string): Promise<QuizInstructionsDto> {
  return apiFetch<QuizInstructionsDto>(`/api/student/quizzes/${id}`);
}

export async function acceptQuizInvitation(
  quizId: string,
): Promise<AcceptInvitationResponse> {
  return apiFetch<AcceptInvitationResponse>(
    `/api/student/quizzes/${quizId}/accept-invitation`,
    { method: 'POST', body: JSON.stringify({}) },
  );
}

export async function getActiveAttempt(): Promise<ActiveAttemptResponse> {
  return apiFetch<ActiveAttemptResponse>('/api/student/attempts/active');
}

export async function startAttempt(quizId: string): Promise<AttemptWithAnswersDto> {
  return apiFetch<AttemptWithAnswersDto>(`/api/student/quizzes/${quizId}/start`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function getAttemptQuestions(
  attemptId: string,
): Promise<AttemptQuestionsResponse> {
  return apiFetch<AttemptQuestionsResponse>(
    `/api/student/attempts/${attemptId}/questions`,
  );
}

export async function saveAnswers(
  attemptId: string,
  answers: SaveAnswersRequest['answers'],
): Promise<void> {
  await apiFetch(`/api/student/attempts/${attemptId}/answers`, {
    method: 'PATCH',
    body: JSON.stringify({ answers }),
  });
}

export async function submitAttempt(
  attemptId: string,
  answers: SubmitAttemptRequest['answers'] = [],
): Promise<AttemptWithAnswersDto> {
  return apiFetch<AttemptWithAnswersDto>(
    `/api/student/attempts/${attemptId}/submit`,
    {
      method: 'POST',
      body: JSON.stringify({ answers }),
    },
  );
}

export async function getAttemptResult(
  attemptId: string,
): Promise<AttemptWithAnswersDto> {
  return apiFetch<AttemptWithAnswersDto>(
    `/api/student/attempts/${attemptId}/result`,
  );
}
