'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { clearToken, getUser, isAuthenticated } from '@/lib/auth/session';
import Container from '@/components/shared/Container';

type GateState =
  | { status: 'invalid_link' }
  | { status: 'unauthenticated' }
  | { status: 'mismatch'; invitedEmail: string; currentEmail: string }
  | { status: 'match' };

function invitationTarget(quizId: string, email: string): string {
  return `/invitation/${quizId}?email=${encodeURIComponent(email)}`;
}

// Every input here (search params, the stored token, the decoded user) is
// available synchronously, so the gate state is derived directly during
// render instead of via setState-in-effect - only the resulting navigation
// is a real side effect.
function computeGateState(email: string | null): GateState {
  if (!email) return { status: 'invalid_link' };
  if (!isAuthenticated()) return { status: 'unauthenticated' };

  const user = getUser();
  if (!user?.email || user.email.toLowerCase() !== email.toLowerCase()) {
    return { status: 'mismatch', invitedEmail: email, currentEmail: user?.email ?? 'unknown' };
  }
  return { status: 'match' };
}

export default function InvitationClient({ quizId }: { quizId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const state = computeGateState(email);

  useEffect(() => {
    if (state.status === 'unauthenticated' && email) {
      router.replace(`/login?redirect=${encodeURIComponent(invitationTarget(quizId, email))}`);
    } else if (state.status === 'match') {
      router.replace(`/student/quizzes/${quizId}`);
    }
  }, [state.status, email, quizId, router]);

  const handleSwitchAccount = () => {
    if (!email) return;
    clearToken();
    router.push(`/login?redirect=${encodeURIComponent(invitationTarget(quizId, email))}`);
  };

  if (state.status === 'invalid_link') {
    return (
      <Container size="quiz">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
          <span className="text-5xl" aria-hidden>
            ⚠️
          </span>
          <h1 className="text-h2 text-foreground">Invalid invitation link</h1>
          <p className="max-w-md text-body text-foreground-secondary">
            This invitation link is missing required information. Please use the link from your
            invitation email.
          </p>
          <a
            href="/student"
            className="mt-2 text-small font-medium text-accent-600 hover:text-accent-700"
          >
            ← Back to dashboard
          </a>
        </div>
      </Container>
    );
  }

  if (state.status === 'mismatch') {
    return (
      <Container size="quiz">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
          <span className="text-5xl" aria-hidden>
            🔒
          </span>
          <h1 className="text-h2 text-foreground">Wrong account</h1>
          <p className="max-w-md text-body text-foreground-secondary">
            This invitation was sent to{' '}
            <span className="font-medium text-foreground">{state.invitedEmail}</span>, but
            you&apos;re signed in as{' '}
            <span className="font-medium text-foreground">{state.currentEmail}</span>.
          </p>
          <button
            onClick={handleSwitchAccount}
            className="mt-2 rounded-full bg-accent-500 px-6 py-2.5 text-body font-semibold text-inverse hover:bg-accent-600"
          >
            Log out and switch accounts
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container size="quiz">
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
          <p className="text-small text-foreground-secondary">Checking your invitation...</p>
        </div>
      </div>
    </Container>
  );
}
