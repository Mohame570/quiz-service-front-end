import { apiFetch } from '@/lib/api/client';
import { QuizData, PaginatedQuizData } from '@/types/quiz/admin';
import { CreateQuizFormValues } from '@/lib/validation';
import { getUser } from '@/lib/auth/session';

export async function getAdminQuizzes(params?: {
  search?: string;
  status?: string;
  page?: number;
}): Promise<PaginatedQuizData> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.status) query.set('status', params.status);
  if (params?.page) query.set('page', String(params.page));
  const qs = query.toString();
  return apiFetch<PaginatedQuizData>(`/api/admin/quizzes${qs ? `?${qs}` : ''}`);
}

export async function getAdminQuizById(id: string): Promise<QuizData> {
  return apiFetch<QuizData>(`/api/admin/quizzes/${id}`);
}

export async function deleteAdminQuiz(id: string): Promise<{ deleted: boolean; id: string }> {
  return apiFetch<{ deleted: boolean; id: string }>(`/api/admin/quizzes/${id}`, {
    method: 'DELETE',
  });
}

export async function updateAdminQuiz(id: string, values: CreateQuizFormValues): Promise<QuizData> {
  return apiFetch<QuizData>(`/api/admin/quizzes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      title: values.title,
      description: values.description,
      durationMinutes: values.durationMinutes,
      passingScore: values.passingScore,
      ...(values.startDate ? { startsAt: values.startDate } : {}),
      ...(values.endDate ? { endsAt: values.endDate } : {}),
    }),
  });
}

export async function createAdminQuiz(values: CreateQuizFormValues): Promise<QuizData> {
  const user = getUser();
  if (!user?.id) {
    throw new Error('You must be signed in as an admin to create a quiz.');
  }

  return apiFetch<QuizData>('/api/admin/quizzes', {
    method: 'POST',
    body: JSON.stringify({
      title: values.title,
      description: values.description,
      status: 'DRAFT',
      durationMinutes: values.durationMinutes,
      passingScore: values.passingScore,
      ...(values.startDate ? { startsAt: values.startDate } : {}),
      ...(values.endDate ? { endsAt: values.endDate } : {}),
      createdById: user.id,
    }),
  });
}

export async function attachQuestionsToQuiz(
  quizId: string,
  questions: { questionId: string; order?: number }[]
): Promise<{ quizId: string; questionId: string; order: number }[]> {
  return apiFetch(`/api/admin/quizzes/${quizId}/questions`, {
    method: 'POST',
    body: JSON.stringify({ questions }),
  });
}

export async function publishAdminQuiz(id: string): Promise<QuizData> {
  return apiFetch<QuizData>(`/api/admin/quizzes/${id}/publish`, {
    method: 'POST',
  });
}

export async function unpublishAdminQuiz(id: string): Promise<QuizData> {
  return apiFetch<QuizData>(`/api/admin/quizzes/${id}/unpublish`, {
    method: 'POST',
  });
}
