'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getQuizzes } from '@/lib/api/student';
import type { QuizDto } from '@/types/quiz/student';
import { useQuizSearch } from '@/components/shared/QuizSearchProvider';
import Breadcrumb from '@/components/shared/Breadcrumb';
import Container from '@/components/shared/Container';
import SectionHeader from '@/components/shared/SectionHeader';
import { filterByTitle } from '@/lib/quiz-filter';
import { isCompletedQuiz } from '@/lib/answer-status';

const statusLabels: Record<QuizDto['attemptStatus'], string> = {
  NOT_STARTED: 'Not started',
  IN_PROGRESS: 'In progress',
  SUBMITTED: 'Completed',
  TIMED_OUT: 'Timed out',
};

const statusStyles: Record<QuizDto['attemptStatus'], string> = {
  NOT_STARTED: 'bg-muted/15 text-foreground-secondary',
  IN_PROGRESS: 'bg-info/10 text-info',
  SUBMITTED: 'bg-success/10 text-success',
  TIMED_OUT: 'bg-error/10 text-error',
};

export default function StudentQuizListPage() {
  const [quizzes, setQuizzes] = useState<QuizDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { query } = useQuizSearch();

  const filteredQuizzes = useMemo(
    () => filterByTitle(quizzes, query),
    [quizzes, query],
  );

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const data = await getQuizzes();
        setQuizzes(data);
      } catch (err) {
        console.error('Failed to fetch quizzes:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchQuizzes();
  }, []);

  return (
    <Container size="page">
      <div className="flex flex-col gap-6 py-8">
        <Breadcrumb
          items={[
            { label: 'PitIQ', href: '/student' },
            { label: 'Quiz List' },
          ]}
        />

        <SectionHeader title="My Quizzes" showSearch={false} />

        {loading ? (
          <div className="text-center text-foreground-secondary">Loading quizzes...</div>
        ) : quizzes.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-border bg-surface px-6 py-16 text-center">
            <h3 className="text-h3 text-foreground">No quizzes available</h3>
            <p className="mt-2 text-small text-foreground-secondary">
              Check back later or contact your admin.
            </p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-border bg-surface px-6 py-16 text-center">
            <h3 className="text-h3 text-foreground">No quizzes match your search</h3>
            <p className="mt-2 text-small text-foreground-secondary">
              Try a different title in the search bar above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredQuizzes.map((quiz) => {
              const completed =
                isCompletedQuiz(quiz.attemptStatus) && quiz.attemptId;
              const href = completed
                ? `/student/quiz/result/${quiz.attemptId}`
                : `/student/quiz/${quiz.id}`;

              return (
              <Link
                key={quiz.id}
                href={href}
                className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-border bg-card transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-accent-200"
              >
                <div className="flex h-40 items-center justify-center bg-gradient-to-br from-primary-800 via-primary-900 to-[#040C24]">
                  <span className="text-caption font-semibold uppercase tracking-wide text-inverse">
                    {quiz.title.slice(0, 30)}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-h3 text-foreground">{quiz.title}</h3>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-caption font-semibold ${statusStyles[quiz.attemptStatus]}`}
                    >
                      {statusLabels[quiz.attemptStatus]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-caption text-muted">
                    <span>{quiz.questionCount} questions</span>
                    <span>{quiz.durationMinutes} min</span>
                  </div>
                  {quiz.attemptStatus === 'IN_PROGRESS' && (
                    <div className="mt-auto pt-2">
                      <span className="text-small font-semibold text-accent-600">
                        Resume →
                      </span>
                    </div>
                  )}
                  {completed && (
                    <div className="mt-auto pt-2">
                      <span className="text-small font-semibold text-accent-600">
                        View result →
                      </span>
                    </div>
                  )}
                </div>
              </Link>
              );
            })}
          </div>
        )}
      </div>
    </Container>
  );
}
