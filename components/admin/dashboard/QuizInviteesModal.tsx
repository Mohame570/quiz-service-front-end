'use client';

import { useEffect, useState } from 'react';
import { Users, RefreshCw, Clock, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getQuizInvitations } from '@/lib/api/admin/quizzes';
import type { QuizInvitee, QuizInviteeStatus } from '@/types/quiz/invitation';

interface Props {
  quizId: string;
  quizTitle: string;
}

function StatusPill({ status }: { status: QuizInviteeStatus }) {
  if (status === 'CLAIMED') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
        <CheckCircle2 className="h-3 w-3" />
        Accepted
      </span>
    );
  }

  if (status === 'EXPIRED') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
        <AlertCircle className="h-3 w-3" />
        Expired
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
      <Clock className="h-3 w-3" />
      Pending
    </span>
  );
}

export default function QuizInviteesModal({ quizId, quizTitle }: Props) {
  const [open, setOpen] = useState(false);
  const [invitees, setInvitees] = useState<QuizInvitee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchInvitees = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getQuizInvitations(quizId);
      setInvitees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invitees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchInvitees();
    }
  }, [open, quizId]);

  const filteredInvitees = invitees.filter((inv) => {
    const matchesSearch = inv.recipientEmail
      .toLowerCase()
      .includes(search.toLowerCase().trim());
    const matchesStatus =
      statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700"
        >
          <Users className="h-3.5 w-3.5 text-slate-500" />
          View Invitees
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Assessment Invitees
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                Real-time invitation statuses for &quot;{quizTitle}&quot;
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchInvitees}
              disabled={loading}
              className="h-8 w-8 p-0"
              title="Refresh invitees"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </DialogHeader>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate email..."
              className="pl-9 h-9 text-xs"
            />
          </div>
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            {(['ALL', 'PENDING', 'CLAIMED', 'EXPIRED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {s === 'ALL' ? 'All' : s === 'CLAIMED' ? 'Accepted' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="mt-4 flex-1 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent mb-2" />
              Loading candidate invitees...
            </div>
          ) : error ? (
            <div className="p-6 text-center text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/20">
              {error}
            </div>
          ) : filteredInvitees.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No candidate invitations match the criteria.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0">
                <tr>
                  <th className="px-4 py-2.5 font-medium text-slate-600 dark:text-slate-400">Recipient Email</th>
                  <th className="px-4 py-2.5 font-medium text-slate-600 dark:text-slate-400">Status</th>
                  <th className="px-4 py-2.5 font-medium text-slate-600 dark:text-slate-400">Sent Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredInvitees.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                      {inv.recipientEmail}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={inv.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(inv.createdAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
