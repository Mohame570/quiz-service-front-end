import { apiFetch } from '@/lib/api/client';
import { QuestionDto, QuestionType } from '@/types/question/question';

export async function getQuestions(params?: {
  type?: QuestionType;
  unassigned?: boolean;
  quizId?: string;
}): Promise<QuestionDto[]> {
  const query = new URLSearchParams();
  if (params?.type) query.set('type', params.type);
  if (params?.unassigned !== undefined) query.set('unassigned', String(params.unassigned));
  if (params?.quizId) query.set('quizId', params.quizId);
  const qs = query.toString();
  return apiFetch<QuestionDto[]>(`/api/questions${qs ? `?${qs}` : ''}`);
}
