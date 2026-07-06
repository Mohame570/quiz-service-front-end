import QuestionBankView from '@/components/admin/dashboard/QuestionBankView';
import { getQuestions } from '@/lib/api/admin/questions';
import { QuestionDto } from '@/types/question/question';

export default async function QuestionBankPage() {
  let questions: QuestionDto[] = [];
  let loadError: string | null = null;
  try {
    questions = await getQuestions();
  } catch (err) {
    loadError = err instanceof Error ? err.message : 'Failed to load questions. Please try again.';
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8 lg:px-10">
        <div className="space-y-2">
          <h1 className="text-h1 text-primary-800">Question Bank</h1>
          <p className="text-body text-foreground-secondary">
            Create and manage questions independent of any single quiz.
          </p>
        </div>

        {loadError ? (
          <p className="text-small text-error">{loadError}</p>
        ) : (
          <QuestionBankView initialQuestions={questions} />
        )}
      </section>
    </main>
  );
}
