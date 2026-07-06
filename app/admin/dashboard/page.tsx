import DashboardHeader from '@/components/admin/dashboard/DashboardHeader';
import DashboardFilter from '@/components/admin/dashboard/DashboardFilter';
import DashboardSearch from '@/components/admin/dashboard/DashboardSearch';
import StatsCard from '@/components/admin/dashboard/StatsCard';
import DashboardQuizTable from '@/components/admin/dashboard/DashboardQuizTable';
import { DASHBOARD_STATS } from '@/constants';
import { searchParamsProps } from '@/types';
import { getAdminQuizzes } from '@/lib/api/admin/quizzes';
import { getQuestions } from '@/lib/api/admin/questions';
import { getDraftScheduleCandidate, getQuizScheduleState, QuizScheduleState } from '@/lib/quiz-status';
import { PaginatedQuizData } from '@/types/quiz/admin';

const VALID_FILTERS = ['all', 'PUBLISHED', 'DRAFT', 'CLOSED', 'ARCHIVED'] as const;
type QuizFilter = (typeof VALID_FILTERS)[number];

function parseFilter(value: unknown): QuizFilter {
  if (typeof value !== 'string') return 'all';

  if (VALID_FILTERS.includes(value as QuizFilter)) {
    return value as QuizFilter;
  }
  return 'all';
}

function parseSearch(value: unknown) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function parsePage(value: unknown): number {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

async function Dashboard({ searchParams }: searchParamsProps) {
  const params = await searchParams;
  const statusFilter = parseFilter(params.status);
  const searchTerm = parseSearch(params.search);
  const currentPage = parsePage(params.page);

  let data: PaginatedQuizData | null = null;
  let loadError: string | null = null;
  try {
    data = await getAdminQuizzes({
      search: searchTerm || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      page: currentPage,
    });
  } catch (err) {
    loadError = err instanceof Error ? err.message : 'Failed to load quizzes. Please try again.';
  }

  const scheduleStateById: Record<string, QuizScheduleState> = {};
  if (data) {
    const elapsedIds = data.quizzes
      .filter((q) => getDraftScheduleCandidate(q) === 'elapsed')
      .map((q) => q.id);

    const hasQuestionsById = new Map<string, boolean>();
    if (elapsedIds.length > 0) {
      const results = await Promise.allSettled(elapsedIds.map((id) => getQuestions({ quizId: id })));
      results.forEach((r, i) => {
        hasQuestionsById.set(elapsedIds[i], r.status === 'fulfilled' ? r.value.length > 0 : true);
      });
    }

    data.quizzes.forEach((q) => {
      scheduleStateById[q.id] = getQuizScheduleState(getDraftScheduleCandidate(q), hasQuestionsById.get(q.id));
    });
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 lg:px-10">
        <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-end">
          <div className="flex w-full flex-col gap-3 items-center lg:items-start ">
            <DashboardHeader
              title={'Quiz Management'}
              description={'Manage, analyze, and organize your academic library.'}
            />
            <DashboardSearch />
          </div>
          <DashboardFilter />
        </div>
        <div className="grid-auto-fit place-items-center gap-4">
          {DASHBOARD_STATS.map((s) => (
            <StatsCard key={s.id} icon={s.icon} label={s.label} value={s.value} />
          ))}
        </div>
        {loadError ? (
          <p className="text-small text-error">{loadError}</p>
        ) : (
          <DashboardQuizTable data={data as PaginatedQuizData} scheduleStateById={scheduleStateById} />
        )}
      </section>
    </main>
  );
}

export default Dashboard;
