'use client';

import { useEffect, useMemo, useState } from 'react';
import { getQuizzes } from '@/lib/api/student';
import type { QuizDto } from '@/types/quiz/student';
import { useQuizSearch } from '@/components/shared/QuizSearchProvider';
import Breadcrumb from '@/components/shared/Breadcrumb';
import Container from '@/components/shared/Container';
import SectionHeader from '@/components/shared/SectionHeader';
import LoadingPanel from '@/components/shared/LoadingPanel';
import EmptyState from '@/components/student/EmptyState';
import StudentQuizCard from '@/components/student/StudentQuizCard';
import { filterByTitle } from '@/lib/quiz-filter';

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
      <div className="flex flex-col gap-8 py-8">
        <Breadcrumb
          items={[
            { label: 'PitIQ', href: '/student' },
            { label: 'Quiz List' },
          ]}
        />

        <SectionHeader title="My Quizzes" showSearch={false} />

        {loading ? (
          <LoadingPanel message="Loading quizzes…" />
        ) : quizzes.length === 0 ? (
          <EmptyState
            title="No quizzes available"
            description="Check back later or contact your admin."
          />
        ) : filteredQuizzes.length === 0 ? (
          <EmptyState
            title="No quizzes match your search"
            description="Try a different title in the search bar above."
          />
        ) : (
          <div className="flex flex-col gap-4">
            {filteredQuizzes.map((quiz) => (
              <StudentQuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
