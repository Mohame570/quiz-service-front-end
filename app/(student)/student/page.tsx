"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getActiveAttempt, getQuizzes } from "@/lib/api/student";
import { useClientUser, userDisplayName } from "@/lib/hooks/useClientUser";
import type { QuizDto } from "@/types/quiz/student";
import Breadcrumb from "@/components/shared/Breadcrumb";
import Container from "@/components/shared/Container";
import WelcomeBanner from "@/components/shared/WelcomeBanner";
import CompletedQuizRow from "@/components/student/CompletedQuizRow";
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
  const completedCount = completedQuizzes.length;

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
            <Link
              href={resumeHref}
              className="inline-flex items-center rounded-full bg-accent-500 px-5 py-2.5 text-small font-semibold text-inverse transition-colors duration-150 ease-out hover:bg-accent-600 focus:outline-2 focus:outline-offset-2 focus:outline-accent-500"
            >
              Resume quiz
            </Link>
          ) : null}
          <Link
            href="/student/quiz-list"
            className="inline-flex items-center rounded-full border border-border bg-surface px-5 py-2.5 text-small font-semibold text-foreground transition-colors duration-150 ease-out hover:border-accent-200 hover:bg-accent-50 focus:outline-2 focus:outline-offset-2 focus:outline-accent-500"
          >
            Browse courses
          </Link>
        </section>

        {loading ? (
          <div className="text-center text-foreground-secondary">
            Loading quizzes...
          </div>
        ) : (
          <>
            <section
              aria-label="Stats"
              className="grid grid-cols-2 gap-3 sm:grid-cols-4"
            >
              <article className="flex flex-col gap-2 rounded-[20px] border border-border bg-card p-5">
                <span className="text-caption uppercase tracking-wide text-muted">
                  Quizzes
                </span>
                <p className="text-h1 text-foreground">{quizzes.length}</p>
                <p className="text-caption text-foreground-secondary">
                  Available
                </p>
              </article>
              <article
                id="completed-results"
                className="flex flex-col gap-2 rounded-[20px] border border-border bg-card p-5"
              >
                <span className="text-caption uppercase tracking-wide text-muted">
                  Completed
                </span>
                <p className="text-h1 text-foreground">{completedCount}</p>
                <p className="text-caption text-foreground-secondary">
                  {completedCount > 0 ? "Submitted — see below" : "Submitted"}
                </p>
              </article>
              <article className="flex flex-col gap-2 rounded-[20px] border border-border bg-card p-5">
                <span className="text-caption uppercase tracking-wide text-muted">
                  In Progress
                </span>
                <p className="text-h1 text-foreground">
                  {
                    quizzes.filter((q) => q.attemptStatus === "IN_PROGRESS")
                      .length
                  }
                </p>
                <p className="text-caption text-foreground-secondary">Active</p>
              </article>
              <article className="flex flex-col gap-2 rounded-[20px] border border-border bg-card p-5">
                <span className="text-caption uppercase tracking-wide text-muted">
                  Not Started
                </span>
                <p className="text-h1 text-foreground">
                  {
                    quizzes.filter((q) => q.attemptStatus === "NOT_STARTED")
                      .length
                  }
                </p>
                <p className="text-caption text-foreground-secondary">
                  Pending
                </p>
              </article>
            </section>

            {completedQuizzes.length > 0 && (
              <section
                aria-label="Completed quizzes"
                className="flex flex-col gap-3"
              >
                <h2 className="text-h2 text-foreground">Completed quizzes</h2>
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
                  <h2 className="text-h2 text-foreground">Continue learning</h2>
                  <Link
                    href="/student/quiz-list"
                    className="text-small font-medium text-accent-600 transition-colors hover:text-accent-700"
                  >
                    Browse all →
                  </Link>
                </div>
                <Link
                  href={resumeHref ?? `/student/quiz/${inProgressQuiz.id}`}
                  className="group flex flex-col overflow-hidden rounded-[20px] border border-border bg-card transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-accent-200 sm:flex-row"
                >
                  <div className="flex h-32 items-center justify-center bg-gradient-to-br from-primary-800 to-primary-900 sm:w-72">
                    <span className="text-caption font-semibold uppercase tracking-wide text-inverse">
                      {inProgressQuiz.title.slice(0, 20)}...
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-caption uppercase tracking-wide text-muted">
                        In progress
                      </span>
                      <h3 className="text-h3 text-foreground">
                        {inProgressQuiz.title}
                      </h3>
                    </div>
                    <div className="mt-auto flex items-center justify-between text-caption text-muted">
                      <span>{inProgressQuiz.questionCount} questions</span>
                      <span>{inProgressQuiz.durationMinutes} min</span>
                    </div>
                  </div>
                </Link>
              </section>
            )}
          </>
        )}
      </div>
    </Container>
  );
}
