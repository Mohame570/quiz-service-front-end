import Link from 'next/link';
import EditQuizForm from '@/components/admin/dashboard/forms/EditQuizForm';
import { Button } from '@/components/ui/button';
import { getAdminQuizById } from '@/lib/api/admin/quizzes';
import { getSettings } from '@/lib/api/admin/settings';
import { QUIZ_STATUS_LABEL, getQuizStatusPill } from '@/lib/quiz-status';
import { ApiError } from '@/lib/api/client';
import { getSafeTimezone } from '@/lib/date';

type EditQuizPageProps = {
  params: Promise<{ id: string }>;
};

function toDateTimeLocal(value: string | null, timezoneLabel: string): string {
  if (!value) return '';

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezoneLabel,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  })
    .formatToParts(new Date(value))
    .reduce<Record<string, string>>((result, part) => {
      if (part.type !== 'literal') result[part.type] = part.value;
      return result;
    }, {});

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export default async function EditPage({ params }: EditQuizPageProps) {
  const { id } = await params;
  let quiz;
  let safeTimeZone: string = 'UTC';

  try {
    quiz = await getAdminQuizById(id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 403) {
      return (
        <main className="min-h-screen bg-background text-foreground">
          <section className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-6 py-16 text-center lg:px-10">
            <h1 className="text-xl font-semibold">Access denied</h1>
            <p className="text-sm text-foreground-secondary">
              Please sign in as an admin to access this page.
            </p>
          </section>
        </main>
      );
    }
  
    throw err;
  }
  
  if (!quiz) return null;
  try {
      const settings = await getSettings();
      const timezoneLabel = settings.timezoneLabel;
      safeTimeZone = getSafeTimezone(timezoneLabel);
  } catch (err) {
      console.warn('Failed to load settings in EditPage, falling back to UTC:', err);
  }


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
            <li className="font-medium text-primary-800">Edit Quiz</li>
          </ol>
        </nav>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-h1 text-primary-800">{quiz.title}</h1>
            <p className="text-caption text-foreground-secondary">
              Last edited on {new Date(quiz.updatedAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start">
            <div
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-small font-medium ${statusPill.container}`}
            >
              <span className={`h-2 w-2 rounded-full ${statusPill.dot}`} aria-hidden="true" />
              <p className={statusPill.text}>{QUIZ_STATUS_LABEL[quiz.status]}</p>
            </div>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-primary-200 text-primary-800 hover:bg-primary-50"
            >
              <Link href={`/admin/dashboard/edit/${id}/questions`}>Manage Questions</Link>
            </Button>
          </div>
        </div>

        <EditQuizForm
          id={id}
          hasAttempts={quiz.hasAttempts}
          title={quiz.title}
          description={quiz.description}
          status={quiz.status}
          durationMinutes={quiz.durationMinutes}
          passingScore={quiz.passingScore}
          startDate={toDateTimeLocal(quiz.startsAt, safeTimeZone)}
          endDate={toDateTimeLocal(quiz.endsAt, safeTimeZone)}
        />
      </section>
    </main>
  );
}
