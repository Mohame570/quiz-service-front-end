'use client';

import { useEffect, useState } from 'react';
import { Bell, Send, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getQuizReminderPreview, sendQuizReminders } from '@/lib/api/admin/quizzes';
import type { ReminderPreviewResponse, SendRemindersResponse } from '@/types/quiz/invitation';

interface Props {
  quizId: string;
  quizTitle: string;
  onRemindersSent?: () => void;
}

export default function QuizReminderModal({
  quizId,
  quizTitle,
  onRemindersSent,
}: Props) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<ReminderPreviewResponse | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SendRemindersResponse | null>(null);

  const fetchPreview = async () => {
    setLoadingPreview(true);
    setError(null);
    setResult(null);
    try {
      const data = await getQuizReminderPreview(quizId);
      setPreview(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch reminder preview.',
      );
    } finally {
      setLoadingPreview(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchPreview();
    }
  }, [open, quizId]);

  const handleSendReminders = async () => {
    setSending(true);
    setError(null);
    try {
      const response = await sendQuizReminders(quizId);
      setResult(response);
      onRemindersSent?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to dispatch quiz reminders.',
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100"
        >
          <Bell className="h-3.5 w-3.5 text-amber-600" />
          Send Reminders
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Quiz Reminders
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                Remind candidates who have not yet accepted their invitation to &quot;{quizTitle}&quot;
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchPreview}
              disabled={loadingPreview || sending}
              className="h-8 w-8 p-0"
              title="Refresh preview"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loadingPreview ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-4">
          {/* Eligibility Note */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/70 dark:border-blue-900/40 dark:bg-blue-950/30 p-3.5 text-xs text-blue-900 dark:text-blue-300">
            <p className="font-semibold">Backend-enforced eligibility:</p>
            <p className="mt-0.5 opacity-90">
              Only candidates with <span className="font-medium">PENDING</span> invitations for this published, active quiz receive reminders. Already accepted, expired, or non-eligible recipients are automatically filtered out.
            </p>
          </div>

          {/* Results feedback banner */}
          {result && (
            <div
              className={`rounded-xl border p-4 text-xs ${
                result.failed === 0
                  ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                  : 'border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Reminders Dispatched</span>
              </div>
              <p className="mt-1">
                Successfully sent {result.sent} reminder(s)
                {result.failed > 0 ? `, ${result.failed} failed` : ''} to local MailHog transport.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-900/40 dark:bg-rose-950/30 p-3 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Preview list */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-surface p-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Eligible Candidates Preview
              </span>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                {loadingPreview ? 'Checking...' : `${preview?.count ?? 0} eligible`}
              </span>
            </div>

            {loadingPreview ? (
              <div className="py-8 text-center text-xs text-slate-500">
                <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-primary-600 border-t-transparent mb-2" />
                Calculating reminder eligibility...
              </div>
            ) : preview?.recipients && preview.recipients.length > 0 ? (
              <div className="mt-3 max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {preview.recipients.map((email) => (
                  <div key={email} className="py-2 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>{email}</span>
                    <span className="text-[11px] text-amber-600 font-medium">Pending invite</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                <AlertTriangle className="h-4 w-4 text-slate-400 mx-auto mb-1" />
                No eligible candidates to remind at this time.
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={
                loadingPreview ||
                sending ||
                !preview ||
                preview.count === 0 ||
                result !== null
              }
              onClick={handleSendReminders}
              className="gap-2 bg-primary-600 hover:bg-primary-700 text-white"
            >
              <Send className={`h-3.5 w-3.5 ${sending ? 'animate-pulse' : ''}`} />
              {sending ? 'Sending Reminders...' : `Remind ${preview?.count ?? 0} Candidate(s)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
