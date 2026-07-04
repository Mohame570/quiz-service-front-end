'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { acceptQuizInvitation } from '@/lib/api/student';
import { ApiError } from '@/lib/api/client';
import { getUser, isAuthenticated } from '@/lib/auth/session';
import { buildQuizInviteRedirect, stageInviteBanner } from '@/lib/quiz-invite-flash';
import Container from '@/components/shared/Container';
import LoadingPanel from '@/components/shared/LoadingPanel';
import EmptyPanel from '@/components/shared/EmptyPanel';
import { Button } from '@/components/ui/button';
import VerifyEmailPrompt from '@/components/student/VerifyEmailPrompt';

type Phase = 'checking' | 'accepting' | 'error' | 'verify';

function isEmailVerificationError(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes('email') && lower.includes('verif');
}

export default function QuizInvitePage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const [phase, setPhase] = useState<Phase>('checking');
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    async function run() {
      if (!isAuthenticated()) {
        router.replace(
          `/login?redirect=${encodeURIComponent(`/student/quizzes/${quizId}`)}`,
        );
        return;
      }

      const user = getUser();
      if (!user?.emailVerified) {
        setPhase('verify');
        return;
      }

      setPhase('accepting');
      try {
        const result = await acceptQuizInvitation(quizId);
        const kind = result.assigned ? 'new' : 'existing';
        stageInviteBanner(quizId, kind);
        router.replace(buildQuizInviteRedirect(quizId, kind));
      } catch (err) {
        if (err instanceof ApiError && err.status === 403) {
          if (isEmailVerificationError(err.message)) {
            setPhase('verify');
            return;
          }
          setError(
            err.message === 'Student role required.'
              ? 'Please sign in with a student account to accept this invitation.'
              : err.message,
          );
          setPhase('error');
          return;
        }

        const msg = err instanceof Error ? err.message : 'Failed to join quiz.';
        setError(msg);
        setPhase('error');
      }
    }

    run();
  }, [quizId, router]);

  if (phase === 'verify') {
    return <VerifyEmailPrompt />;
  }

  if (phase === 'checking' || phase === 'accepting') {
    return (
      <Container size="quiz">
        <div className="py-8">
          <LoadingPanel message="Joining quiz…" />
        </div>
      </Container>
    );
  }

  return (
    <Container size="quiz">
      <div className="py-8">
        <EmptyPanel
          title="Could not join quiz"
          description={error ?? 'This quiz is not available.'}
          action={
            <Button
              asChild
              className="rounded-full bg-primary-800 px-6 text-white hover:bg-primary-700"
            >
              <Link href="/student/quiz-list">Back to quiz list</Link>
            </Button>
          }
        />
      </div>
    </Container>
  );
}
