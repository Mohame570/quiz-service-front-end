"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle2 } from "lucide-react";
import { getActiveAttempt, getQuizzes } from "@/lib/api/student";
import { useClientUser, userDisplayName } from "@/lib/hooks/useClientUser";
import type { QuizDto } from "@/types/quiz/student";
import Breadcrumb from "@/components/shared/Breadcrumb";
import Container from "@/components/shared/Container";
import WelcomeBanner from "@/components/shared/WelcomeBanner";
import LoadingPanel from "@/components/shared/LoadingPanel";
import SectionTitle from "@/components/shared/SectionTitle";
import { Button } from "@/components/ui/button";
import CompletedQuizRow from "@/components/student/CompletedQuizRow";
import EmptyState from "@/components/student/EmptyState";
import StudentQuizCard from "@/components/student/StudentQuizCard";
import StudentStatsGrid from "@/components/student/StudentStatsGrid";
import { isCompletedQuiz } from "@/lib/answer-status";

export default function StudentDashboardPage() {
  const [quizzes, setQuizzes] = useState<QuizDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(null);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const user = useClientUser();

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const data = await getQuizzes();
        setQuizzes(data);
      } catch (err) {
        console.error("Failed to fetch quizzes:", err);
      } finally {
        setLoading(false);
      }
    }

    async function fetchActive() {
      try {
        const data = await getActiveAttempt();
        if (data.attempt) {
          setActiveAttemptId(data.attempt.attemptId);
          setActiveQuizId(data.attempt.quizId);
        } else {
          setActiveAttemptId(null);
          setActiveQuizId(null);
        }
      } catch (err) {
        console.error("Failed to fetch active attempt:", err);
      }
    }

    fetchQuizzes();
    fetchActive();
  }, []);

  const inProgressQuiz = quizzes.find((q) => q.attemptStatus === "IN_PROGRESS");
  const completedQuizzes = quizzes.filter((q) => isCompletedQuiz(q.attemptStatus));

  const resumeQuizId = activeQuizId ?? inProgressQuiz?.id ?? null;
  const resumeAttemptId = activeAttemptId ?? inProgressQuiz?.attemptId ?? null;
  const resumeHref =
    resumeQuizId && resumeAttemptId
      ? `/student/quiz/${resumeQuizId}/solve?attemptId=${resumeAttemptId}`
      : null;

  return (
    <Container size="page">
      <div className="flex flex-col gap-8 py-8">
        <Breadcrumb
          items={[{ label: "PitIQ", href: "/student" }, { label: "Dashboard" }]}
        />

        <WelcomeBanner
          name={userDisplayName(user)}
          subtitle="Pick up where you left off, browse new quizzes, and track your progress."
        />

        <section
          aria-label="Quick actions"
          className="flex flex-wrap items-center gap-3"
        >
          {resumeHref ? (
            <Button
              asChild
              className="rounded-full bg-primary-800 px-5 text-white hover:bg-primary-700"
            >
              <Link href={resumeHref}>Resume quiz</Link>
            </Button>
          ) : null}
          <Button
            asChild
            variant="outline"
            className="rounded-full border-primary-200 text-primary-800 hover:bg-primary-50"
          >
            <Link href="/student/quiz-list">Browse courses</Link>
          </Button>
        </section>

        {loading ? (
          <LoadingPanel message="Loading quizzes…" />
        ) : quizzes.length === 0 ? (
          <EmptyState
            action={
              <Button
                asChild
                className="rounded-full bg-primary-800 px-6 text-white hover:bg-primary-700"
              >
                <Link href="/student/quiz-list">Browse quiz list</Link>
              </Button>
            }
          />
        ) : (
          <>
            <StudentStatsGrid quizzes={quizzes} />

            {completedQuizzes.length > 0 && (
              <section
                aria-label="Completed quizzes"
                className="flex flex-col gap-3"
              >
                <SectionTitle
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  title="Completed quizzes"
                />
                <p className="text-small text-foreground-secondary">
                  Recheck your results for finished quizzes.
                </p>
                <ul className="flex flex-col gap-2">
                  {completedQuizzes.map((quiz) => (
                    <CompletedQuizRow key={quiz.id} quiz={quiz} />
                  ))}
                </ul>
              </section>
            )}

            {inProgressQuiz && (
              <section
                aria-label="Continue learning"
                className="flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <SectionTitle
                    icon={<BookOpen className="h-4 w-4" />}
                    title="Continue learning"
                  />
                  <Link
                    href="/student/quiz-list"
                    className="text-small font-medium text-accent-600 transition-colors hover:text-accent-700"
                  >
                    Browse all →
                  </Link>
                </div>
                <StudentQuizCard
                  quiz={inProgressQuiz}
                  href={resumeHref ?? `/student/quiz/${inProgressQuiz.id}`}
                />
              </section>
            )}
          </>
        )}
      </div>
    </Container>
  );
}
