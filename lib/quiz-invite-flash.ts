const KEY_PREFIX = 'quiz-invite-added:';

export function setQuizAddedFlash(quizId: string, title: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(`${KEY_PREFIX}${quizId}`, title);
}

export function consumeQuizAddedFlash(quizId: string): string | null {
  if (typeof window === 'undefined') return null;
  const key = `${KEY_PREFIX}${quizId}`;
  const title = sessionStorage.getItem(key);
  if (title) sessionStorage.removeItem(key);
  return title;
}
