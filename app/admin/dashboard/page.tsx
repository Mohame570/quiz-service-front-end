import DashboardHeader from '@/components/admin/dashboard/DashboardHeader';
import DashboardFilter from '@/components/admin/dashboard/DashboardFilter';
import DashboardSearch from '@/components/admin/dashboard/DashboardSearch';
import StatsCard from '@/components/admin/dashboard/StatsCard';
import DashboardQuizTable from '@/components/admin/dashboard/DashboardQuizTable';
import { getAnalyticsSummary } from '@/lib/api/admin/analytics';
import type { DashboardSummary } from '@/lib/api/admin/analytics';
import { STAT_UNAVAILABLE } from '@/lib/format';
import { searchParamsProps } from '@/types';
import { getAdminQuizzes } from '@/lib/api/admin/quizzes';
import { getQuestions } from '@/lib/api/admin/questions';
import { getDraftScheduleCandidate, getQuizScheduleState, QuizScheduleState } from '@/lib/quiz-status';
import { PaginatedQuizData } from '@/types/quiz/admin';
import { AlertCircle } from 'lucide-react';

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
  let analyticsSummary: DashboardSummary | null = null;

  const [quizzesResult, analyticsResult] = await Promise.allSettled([
    getAdminQuizzes({
      search: searchTerm || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      page: currentPage,
    }),
    getAnalyticsSummary(),
  ]);

  if (quizzesResult.status === 'fulfilled') {
    data = quizzesResult.value;
  } else {
    const err = quizzesResult.reason;
    loadError = err instanceof Error ? err.message : 'Failed to load quizzes. Please try again.';
  }

  if (analyticsResult.status === 'fulfilled') {
    analyticsSummary = analyticsResult.value;
  }

  const totalQuizzesVal =
    data?.totalItems != null
      ? String(data.totalItems)
      : analyticsSummary?.totalQuizzes != null
        ? String(analyticsSummary.totalQuizzes)
        : STAT_UNAVAILABLE;

  const totalStudentsVal =
    analyticsSummary?.totalStudents != null && !Number.isNaN(analyticsSummary.totalStudents)
      ? String(analyticsSummary.totalStudents)
      : STAT_UNAVAILABLE;

  const totalAttemptsVal =
    analyticsSummary?.totalAttempts != null && !Number.isNaN(analyticsSummary.totalAttempts)
      ? String(analyticsSummary.totalAttempts)
      : STAT_UNAVAILABLE;

  const avgScoreVal =
    analyticsSummary &&
    analyticsSummary.totalAttempts > 0 &&
    analyticsSummary.averageScore != null &&
    !Number.isNaN(analyticsSummary.averageScore)
      ? `${Math.round(analyticsSummary.averageScore)}%`
      : STAT_UNAVAILABLE;

  const dashboardStats = [
    {
      id: 'total-quizzes',
      icon: '📚',
      label: 'Total Quizzes',
      value: totalQuizzesVal,
    },
    {
      id: 'total-students',
      icon: '👥',
      label: 'Total Students',
      value: totalStudentsVal,
    },
    {
      id: 'total-attempts',
      icon: '📝',
      label: 'Total Attempts',
      value: totalAttemptsVal,
    },
    {
      id: 'avg-score',
      icon: '⭐',
      label: 'Avg. Score',
      value: avgScoreVal,
    },
  ];

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
        {/* Header */}
        <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-end">
          <div className="flex w-full flex-col gap-3 items-center lg:items-start">
            <DashboardHeader
              title={'Admin Command Centre'}
              description={'Manage, analyze, and oversee live quizzes and platform users.'}
            />
            <DashboardSearch />
          </div>
          <DashboardFilter />
        </div>

        {/* Live KPI Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardStats.map((s) => (
            <StatsCard key={s.id} icon={s.icon} label={s.label} value={s.value} />
          ))}
        </div>

        {/* Quiz Records Table or Error */}
        {loadError ? (
          <div
            className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/40 p-4 text-rose-800 dark:text-rose-300"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <h4 className="font-semibold text-sm">Failed to load quiz records</h4>
              <p className="text-xs opacity-90">{loadError}</p>
            </div>
          </div>
        ) : (
          <DashboardQuizTable data={data as PaginatedQuizData} scheduleStateById={scheduleStateById} />
        )}
      </section>
    </main>
  );
}

export default Dashboard;
