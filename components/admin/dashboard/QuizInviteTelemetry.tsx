'use client';

import { useEffect, useState } from 'react';
import { Mail, RefreshCw, AlertTriangle, CheckCircle2, Clock, Users } from 'lucide-react';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { getInvitationStatus } from '@/lib/api/admin/notifications';
import type { InvitationStatus } from '@/types/notification/notification';
import InviteStudentsPanel from './forms/InviteStudentsPanel';
import QuizInviteesModal from './QuizInviteesModal';
import QuizReminderModal from './QuizReminderModal';
import { QuizDetail, QuizData } from '@/types/quiz/admin';

type Props = {
  quiz: QuizDetail | QuizData;
};

export default function QuizInviteTelemetry({ quiz }: Props) {
  const [stats, setStats] = useState<InvitationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTelemetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const allStats = await getInvitationStatus();
      const match = allStats.find((invitationStat) => invitationStat.quizId === quiz.id) || null;
      setStats(match);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invitation telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getInvitationStatus()
      .then((allStats) => {
        if (!active) return;
        const match = allStats.find((invitationStat) => invitationStat.quizId === quiz.id) || null;
        setStats(match);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to fetch invitation telemetry.');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [quiz.id]);

  const totalInvited = stats?.totalInvited ?? 0;
  const totalSent = stats?.totalSent ?? 0;
  const totalPending = stats?.totalPending ?? 0;
  const totalFailed = stats?.totalFailed ?? 0;

  return (
    <Card className="flex flex-col gap-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-divider pb-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-700">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800">Invitations & Delivery Telemetry</h3>
            <p className="text-xs text-slate-500">
              Track candidate invite dispatches and delivery confirmations for this assessment.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchTelemetry}
            disabled={loading}
            className="h-8 gap-1.5 text-xs text-slate-600"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <QuizInviteesModal quizId={quiz.id} quizTitle={quiz.title} />

          {quiz.status === 'PUBLISHED' && (
            <QuizReminderModal
              quizId={quiz.id}
              quizTitle={quiz.title}
              onRemindersSent={fetchTelemetry}
            />
          )}

          {quiz.status === 'PUBLISHED' ? (
            <InviteStudentsPanel quizId={quiz.id} quizTitle={quiz.title} />
          ) : (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              Publish quiz to invite candidates
            </span>
          )}
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Total Candidates Invited */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
            <div className="flex items-center justify-between text-xs font-medium text-slate-600">
              <span>Total Invited</span>
              <Users className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{totalInvited}</p>
          </div>

          {/* Delivered / Sent */}
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/30 p-4">
            <div className="flex items-center justify-between text-xs font-medium text-emerald-700">
              <span>Sent & Delivered</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-900">{totalSent}</p>
          </div>

          {/* Pending */}
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/30 p-4">
            <div className="flex items-center justify-between text-xs font-medium text-amber-700">
              <span>Pending Delivery</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-amber-900">{totalPending}</p>
          </div>

          {/* Failed */}
          <div className="rounded-xl border border-red-200/80 bg-red-50/30 p-4">
            <div className="flex items-center justify-between text-xs font-medium text-red-700">
              <span>Failed</span>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-red-900">{totalFailed}</p>
          </div>
        </div>
      )}
    </Card>
  );
}
