'use client';

import { useEffect, useState } from 'react';
import Container from '@/components/shared/Container';
import Breadcrumb from '@/components/shared/Breadcrumb';
import LoadingPanel from '@/components/shared/LoadingPanel';
import EmptyPanel from '@/components/shared/EmptyPanel';
import Card from '@/components/ui/Card';
import {
  getStudentProfile,
  type StudentProfileResponse,
} from '@/lib/api/student';

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getStudentProfile()
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load profile.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <Container size="quiz">
        <div className="py-8">
          <EmptyPanel title="Failed to load profile" description={error} />
        </div>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container size="quiz">
        <div className="py-8">
          <LoadingPanel message="Loading profile…" />
        </div>
      </Container>
    );
  }

  return (
    <Container size="quiz">
      <div className="flex flex-col gap-8 py-8">
        <Breadcrumb
          items={[{ label: 'PitIQ', href: '/student' }, { label: 'Profile' }]}
        />

        <header>
          <p className="text-caption uppercase tracking-wide text-muted-foreground">
            Student
          </p>
          <h1 className="text-h2 text-foreground">My Profile</h1>
        </header>

        <Card className="p-8">
          <h2 className="mb-4 text-h3 text-foreground">Topic Performance</h2>
          {profile.topicSignals.length === 0 ? (
            <p className="text-small text-muted-foreground">
              No graded answers yet — topic signals will appear after your first submitted quiz.
            </p>
          ) : (
            <div className="grid gap-4">
              {profile.topicSignals.map((signal) => (
                <div key={signal.topic}>
                  <div className="mb-1 flex items-center justify-between text-small">
                    <span className="font-medium text-foreground">{signal.topic}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {signal.correct}/{signal.total} · {signal.rate}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-primary-700"
                      style={{ width: `${signal.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-8">
          <h2 className="mb-4 text-h3 text-foreground">Attempt History</h2>
          {profile.history.length === 0 ? (
            <p className="text-small text-muted-foreground">
              No submitted attempts yet.
            </p>
          ) : (
            <div className="grid gap-3">
              {profile.history.map((item) => (
                <div
                  key={item.attemptId}
                  className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-foreground">{item.quizTitle}</p>
                    <p className="text-caption text-muted-foreground">
                      {item.submittedAt
                        ? new Date(item.submittedAt).toLocaleString()
                        : '—'}
                    </p>
                  </div>
                  <span className="tabular-nums text-small font-semibold text-foreground">
                    {item.score ?? '—'}/{item.maxScore ?? '—'}
                    {item.percentage != null && ` · ${item.percentage}%`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Container>
  );
}
