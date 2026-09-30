'use client';

// components/admin/dashboard/InvitationStatusTable.tsx
//
// Displays per-quiz invitation delivery status breakdown.
// Consumed by: app/admin/dashboard/notifications/page.tsx

import type { InvitationStatus } from '@/types/notification/notification';
import QuizInviteesModal from './QuizInviteesModal';
import QuizReminderModal from './QuizReminderModal';

function StatusBadge({ sent, failed, pending }: { sent: number; failed: number; pending: number }) {
  const total = sent + failed + pending;
  if (total === 0) return <span className="text-sm text-foreground-secondary">—</span>;

  const sentPct = Math.round((sent / total) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
        <div className="flex h-full">
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${sentPct}%` }}
          />
          <div
            className="h-full bg-red-400 transition-all"
            style={{ width: `${Math.round((failed / total) * 100)}%` }}
          />
          <div
            className="h-full bg-amber-400 transition-all"
            style={{ width: `${Math.round((pending / total) * 100)}%` }}
          />
        </div>
      </div>
      <span className="text-xs text-foreground-secondary">{sentPct}%</span>
    </div>
  );
}

export default function InvitationStatusTable({
  invitations,
}: {
  invitations: InvitationStatus[];
}) {
  if (invitations.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <p className="text-body text-foreground-secondary">
          No invitation data available yet. Invitations sent to students will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-h3 font-semibold text-foreground">Invitation Status by Quiz</h2>
      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-4 py-3 font-medium text-foreground-secondary">Quiz</th>
              <th className="px-4 py-3 font-medium text-foreground-secondary">Invited</th>
              <th className="px-4 py-3 font-medium text-foreground-secondary">Sent</th>
              <th className="px-4 py-3 font-medium text-foreground-secondary">Failed</th>
              <th className="px-4 py-3 font-medium text-foreground-secondary">Pending</th>
              <th className="px-4 py-3 font-medium text-foreground-secondary">Delivery</th>
              <th className="px-4 py-3 font-medium text-foreground-secondary text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {invitations.map((inv) => (
              <tr key={inv.quizId} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">
                  {inv.quizTitle ?? inv.quizId}
                </td>
                <td className="px-4 py-3 text-foreground-secondary">{inv.totalInvited}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {inv.totalSent}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    {inv.totalFailed}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    {inv.totalPending}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge sent={inv.totalSent} failed={inv.totalFailed} pending={inv.totalPending} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <QuizInviteesModal quizId={inv.quizId} quizTitle={inv.quizTitle ?? 'Quiz'} />
                    <QuizReminderModal quizId={inv.quizId} quizTitle={inv.quizTitle ?? 'Quiz'} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
