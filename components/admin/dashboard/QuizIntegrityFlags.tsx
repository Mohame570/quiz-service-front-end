'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, ShieldCheck, RefreshCw, ExternalLink, AlertTriangle } from 'lucide-react';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { getSuspiciousAttempts } from '@/lib/api/admin/integrity';
import type { SuspiciousAttempt } from '@/types/integrity/integrity';
import { QuizDetail, QuizData } from '@/types/quiz/admin';

type Props = {
  quiz: QuizDetail | QuizData;
};

export default function QuizIntegrityFlags({ quiz }: Props) {
  const [attempts, setAttempts] = useState<SuspiciousAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlags = async () => {
    setLoading(true);
    setError(null);
    try {
      const suspiciousAttempts = await getSuspiciousAttempts({ quizId: quiz.id });
      setAttempts(suspiciousAttempts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load integrity flags.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getSuspiciousAttempts({ quizId: quiz.id })
      .then((suspiciousAttempts) => {
        if (!active) return;
        setAttempts(suspiciousAttempts);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load integrity flags.');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [quiz.id]);

  const flaggedCount = attempts.length;

  return (
    <Card className="flex flex-col gap-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-divider pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`grid h-9 w-9 place-items-center rounded-lg ${
              flaggedCount > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {flaggedCount > 0 ? (
              <ShieldAlert className="h-5 w-5" />
            ) : (
              <ShieldCheck className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-800">Integrity & Proctoring Flags</h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  flaggedCount > 0
                    ? 'bg-red-100 text-red-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {flaggedCount} {flaggedCount === 1 ? 'flagged attempt' : 'flagged attempts'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Monitors suspicious candidate behaviors (tab switching, window blur, fullscreen exits).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchFlags}
            disabled={loading}
            className="h-8 gap-1.5 text-xs text-slate-600"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <Link href="/admin/dashboard/integrity">
              <ExternalLink className="h-3.5 w-3.5" />
              Full Integrity Console
            </Link>
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          {error}
        </div>
      ) : flaggedCount === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-6 text-center text-slate-500">
          <ShieldCheck className="h-8 w-8 text-emerald-500" />
          <p className="text-sm font-medium text-slate-700">Clean Integrity Record</p>
          <p className="text-xs text-slate-500">
            No candidate attempts have exceeded the suspicious event threshold for this quiz.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-divider bg-slate-50/50 text-slate-600">
              <tr>
                <th className="px-3 py-2 font-medium">Attempt ID</th>
                <th className="px-3 py-2 font-medium">Student</th>
                <th className="px-3 py-2 font-medium">Event Count</th>
                <th className="px-3 py-2 font-medium">Last Event</th>
                <th className="px-3 py-2 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider text-slate-700">
              {attempts.map((attempt) => (
                <tr key={attempt.attemptId} className="hover:bg-slate-50/50">
                  <td className="px-3 py-2.5 font-mono text-slate-500">
                    {attempt.attemptId.slice(0, 8)}...
                  </td>
                  <td className="px-3 py-2.5 font-medium text-slate-900">
                    {attempt.studentName || attempt.studentId}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 font-semibold text-red-700">
                      <AlertTriangle className="h-3 w-3" />
                      {attempt.eventCount} events
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-500">
                    {attempt.events?.[0]
                      ? `${attempt.events[0].eventType} (${new Date(
                          attempt.events[0].occurredAt
                        ).toLocaleTimeString()})`
                      : attempt.latestEventAt
                      ? new Date(attempt.latestEventAt).toLocaleTimeString()
                      : 'N/A'}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-primary-700">
                      <Link href="/admin/dashboard/integrity">Review</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
