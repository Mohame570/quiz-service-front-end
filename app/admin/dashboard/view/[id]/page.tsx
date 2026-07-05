import Link from 'next/link';
import QuizResultsTable from '@/components/admin/dashboard/QuizResultsTable';
import { Button } from '@/components/ui/button';
import { getAdminQuizById } from '@/lib/api/admin/quizzes';
import { QUIZ_STATUS_LABEL, getQuizStatusPill } from '@/lib/quiz-status';

type ViewQuizPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ViewQuizPage({ params }: ViewQuizPageProps) {
  const { id } = await params;
  const quiz = await getAdminQuizById(id);

  if (!quiz) return null;

  const statusPill = getQuizStatusPill(quiz.status);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8 lg:px-10">
        <nav aria-label="Breadcrumb" className="text-small text-foreground-secondary">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/admin/dashboard" className="transition-colors hover:text-primary-700">
                Quizzes
              </Link>
            </li>
            <li aria-hidden="true" className="text-muted-foreground">
              &gt;
            </li>
            <li className="font-medium text-primary-800">View Quiz</li>
          </ol>
        </nav>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-h1 text-primary-800">{quiz.title}</h1>
            <p className="text-body text-foreground-secondary">{quiz.description}</p>
          </div>

          <div
            className={`flex items-center justify-center gap-2 rounded-full px-3 py-1 text-small font-medium ${statusPill.container} text-center max-w-25`}
          >
            <span className={`h-2 w-2 rounded-full ${statusPill.dot}`} aria-hidden="true" />
            <p className={statusPill.text}>{QUIZ_STATUS_LABEL[quiz.status]}</p>
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4">
            <dt className="text-caption uppercase tracking-wide text-muted-foreground">Duration</dt>
            <dd className="text-h3 text-foreground">{quiz.durationMinutes} min</dd>
          </div>
          <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4">
            <dt className="text-caption uppercase tracking-wide text-muted-foreground">
              Passing Score
            </dt>
            <dd className="text-h3 text-foreground">{quiz.passingScore}%</dd>
          </div>
          <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4">
            <dt className="text-caption uppercase tracking-wide text-muted-foreground">Starts</dt>
            <dd className="text-small text-foreground">
              {quiz.startsAt ? new Date(quiz.startsAt).toLocaleDateString() : 'Anytime'}
            </dd>
          </div>
          <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4">
            <dt className="text-caption uppercase tracking-wide text-muted-foreground">Ends</dt>
            <dd className="text-small text-foreground">
              {quiz.endsAt ? new Date(quiz.endsAt).toLocaleDateString() : 'No deadline'}
            </dd>
          </div>
        </dl>

        <div className="flex flex-col gap-4">
          <h2 className="text-h3 font-semibold text-foreground">Results</h2>
          <QuizResultsTable quizId={id} />
        </div>
      </section>
    </main>
  );
}
