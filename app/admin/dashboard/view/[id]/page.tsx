import { getAdminQuizById } from '@/lib/api/admin/quizzes';
import { getPublicSettings } from '@/lib/api/admin/settings';
import { ApiError } from '@/lib/api/client';
import QuizOperationsHub from '@/components/admin/dashboard/QuizOperationsHub';

type ViewQuizPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ViewQuizPage({ params }: ViewQuizPageProps) {
  const { id } = await params;
  let quiz;
  let timezoneLabel = 'UTC';

  try {
    quiz = await getAdminQuizById(id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 403) {
      return (
        <main className="min-h-screen bg-background text-foreground">
          <section className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-6 py-16 text-center lg:px-10">
            <h1 className="text-xl font-semibold">Access denied</h1>
            <p className="text-sm text-foreground-secondary">
              Please sign in as an admin to access this operations hub.
            </p>
          </section>
        </main>
      );
    }
    throw err;
  }

  if (!quiz) return null;

  try {
    const settings = await getPublicSettings();
    if (settings?.timezoneLabel) {
      timezoneLabel = settings.timezoneLabel;
    }
  } catch (err) {
    console.warn('Failed to load public settings for view page, using default UTC:', err);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8 lg:px-10">
        <QuizOperationsHub initialQuiz={quiz} initialTimezoneLabel={timezoneLabel} />
      </section>
    </main>
  );
}
