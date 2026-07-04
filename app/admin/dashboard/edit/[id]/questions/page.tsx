import Link from 'next/link';
import AttachQuestionsPanel from '@/components/admin/dashboard/forms/AttachQuestionsPanel';
import { getAdminQuizById } from '@/lib/api/admin/quizzes';
import { QUIZ_STATUS_LABEL, getQuizStatusPill } from '@/lib/quiz-status';

type QuizQuestionsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function QuizQuestionsPage({ params }: QuizQuestionsPageProps) {
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
            <li>
              <Link
                href={`/admin/dashboard/edit/${id}`}
                className="transition-colors hover:text-primary-700"
              >
                Edit Quiz
              </Link>
            </li>
            <li aria-hidden="true" className="text-muted-foreground">
              &gt;
            </li>
            <li className="font-medium text-primary-800">Questions</li>
          </ol>
        </nav>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-h1 text-primary-800">{quiz.title}</h1>
            <p className="text-caption text-foreground-secondary">
              Attach questions from the bank and publish when ready.
            </p>
          </div>

          <div
            className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1 text-small font-medium ${statusPill.container}`}
          >
            <span className={`h-2 w-2 rounded-full ${statusPill.dot}`} aria-hidden="true" />
            <p className={statusPill.text}>{QUIZ_STATUS_LABEL[quiz.status]}</p>
          </div>
        </div>

        <AttachQuestionsPanel quizId={id} status={quiz.status} />
      </section>
    </main>
  );
}
