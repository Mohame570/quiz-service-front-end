'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  Award,
  HelpCircle,
  Calendar,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { QuizDetail, QuizData } from '@/types/quiz/admin';
import { QUIZ_STATUS_LABEL, getQuizStatusPill } from '@/lib/quiz-status';
import { getPublicSettings } from '@/lib/api/admin/settings';
import { getQuestions } from '@/lib/api/admin/questions';
import { getQuizResults } from '@/lib/api/admin/results';
import type { Result } from '@/types/quiz/result';
import Card from '@/components/ui/Card';
import QuizStatusActions from './QuizStatusActions';
import QuizInviteTelemetry from './QuizInviteTelemetry';
import QuizIntegrityFlags from './QuizIntegrityFlags';
import QuizResultsTable from './QuizResultsTable';

type Props = {
  initialQuiz: QuizDetail;
  initialTimezoneLabel?: string;
};

export default function QuizOperationsHub({
  initialQuiz,
  initialTimezoneLabel = 'UTC',
}: Props) {
  const [quiz, setQuiz] = useState<QuizDetail>(initialQuiz);
  const [timezoneLabel, setTimezoneLabel] = useState<string>(initialTimezoneLabel);
  const [questionCount, setQuestionCount] = useState<number | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Fetch public timezone setting if not provided
    getPublicSettings()
      .then((settings) => {
        if (mounted && settings?.timezoneLabel) {
          setTimezoneLabel(settings.timezoneLabel);
        }
      })
      .catch((error) => {
        console.warn('Failed to load timezone setting, using fallback:', error);
      });

    // Fetch attached question count
    getQuestions({ quizId: quiz.id })
      .then((questions) => {
        if (mounted) {
          setQuestionCount(questions.length);
        }
      })
      .catch((error) => {
        console.warn('Failed to load question count for quiz:', error);
      });

    // Fetch quiz results for summary KPIs
    getQuizResults(quiz.id)
      .then((quizResults) => {
        if (mounted) {
          setResults(quizResults);
        }
      })
      .catch((error) => {
        console.warn('Failed to load quiz results:', error);
      })
      .finally(() => {
        if (mounted) setLoadingMetrics(false);
      });

    return () => {
      mounted = false;
    };
  }, [quiz.id]);

  const statusPill = getQuizStatusPill(quiz.status);

  // Compute results metrics
  const totalSubmissions = results.length;
  const passedCount = results.filter((r) => r.passed === true).length;
  const passRate =
    totalSubmissions > 0 ? Math.round((passedCount / totalSubmissions) * 100) : null;
  const avgPercentage =
    totalSubmissions > 0
      ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / totalSubmissions)
      : null;

  const handleStatusChange = (updated: QuizData) => {
    setQuiz((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  const formattedStart = quiz.startsAt
    ? new Date(quiz.startsAt).toLocaleDateString()
    : 'Anytime';
  const formattedEnd = quiz.endsAt
    ? new Date(quiz.endsAt).toLocaleDateString()
    : 'No deadline';

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/admin/dashboard" className="transition-colors hover:text-primary-700">
              Quizzes
            </Link>
          </li>
          <li aria-hidden="true" className="text-slate-400">
            /
          </li>
          <li className="font-semibold text-slate-800">Operations Hub</li>
          <li aria-hidden="true" className="text-slate-400">
            /
          </li>
          <li className="truncate font-medium text-slate-600">{quiz.title}</li>
        </ol>
      </nav>

      {/* Header & Status Actions */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
              {quiz.title}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusPill.container} ${statusPill.text}`}
            >
              <span className={`h-2 w-2 rounded-full ${statusPill.dot}`} aria-hidden="true" />
              {QUIZ_STATUS_LABEL[quiz.status]}
            </span>
          </div>
          <p className="max-w-3xl text-sm text-slate-600">{quiz.description}</p>
        </div>

        <div className="self-start">
          <QuizStatusActions quiz={quiz} onStatusChange={handleStatusChange} />
        </div>
      </div>

      {/* Warning banner if DRAFT has no questions */}
      {quiz.status === 'DRAFT' && questionCount === 0 && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>
              This quiz cannot be published until at least one question is attached.
            </span>
          </div>
          <Link
            href={`/admin/dashboard/edit/${quiz.id}/questions`}
            className="shrink-0 font-semibold underline hover:text-amber-900"
          >
            Attach Questions
          </Link>
        </div>
      )}

      {/* Primary KPI & Overview Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {/* Duration */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>Duration</span>
          </div>
          <p className="mt-2 text-xl font-bold text-slate-900">{quiz.durationMinutes} min</p>
        </div>

        {/* Passing Score */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Award className="h-3.5 w-3.5 text-slate-400" />
            <span>Pass Threshold</span>
          </div>
          <p className="mt-2 text-xl font-bold text-slate-900">{quiz.passingScore}%</p>
        </div>

        {/* Questions Count */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
            <span>Questions</span>
          </div>
          <p className="mt-2 text-xl font-bold text-slate-900">
            {questionCount !== null ? questionCount : '...'}
          </p>
        </div>

        {/* Total Submissions */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            <span>Submissions</span>
          </div>
          <p className="mt-2 text-xl font-bold text-slate-900">
            {loadingMetrics ? '...' : totalSubmissions}
          </p>
        </div>

        {/* Pass Rate */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
            <span>Pass Rate</span>
          </div>
          <p className="mt-2 text-xl font-bold text-slate-900">
            {loadingMetrics ? '...' : passRate !== null ? `${passRate}%` : '—'}
          </p>
        </div>

        {/* Average Score */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
            <span>Avg Score</span>
          </div>
          <p className="mt-2 text-xl font-bold text-slate-900">
            {loadingMetrics ? '...' : avgPercentage !== null ? `${avgPercentage}%` : '—'}
          </p>
        </div>
      </div>

      {/* Schedule Window Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary-600" />
          <span className="font-medium text-slate-900">Schedule Window:</span>
          <span>
            {formattedStart} → {formattedEnd}
          </span>
          <span className="rounded bg-primary-100 px-2 py-0.5 font-semibold text-primary-800">
            {timezoneLabel}
          </span>
        </div>
        <p className="text-[11px] text-slate-500">
          Institutional timezone applied from platform settings
        </p>
      </div>

      {/* Invitation Telemetry */}
      <QuizInviteTelemetry quiz={quiz} />

      {/* Integrity & Proctoring Reviews */}
      <QuizIntegrityFlags quiz={quiz} />

      {/* Candidate Results & Submissions */}
      <Card className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between border-b border-divider pb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-800">Candidate Results</h3>
            <p className="text-xs text-slate-500">
              Detailed list of candidate submissions, scores, and grading statuses.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {totalSubmissions} attempts recorded
          </span>
        </div>
        <QuizResultsTable quizId={quiz.id} />
      </Card>
    </div>
  );
}
