'use client';

import { useEffect, useState } from 'react';
import {
  Activity,
  RefreshCw,
  Search,
  Shield,
  UserCheck,
  Globe,
  Laptop,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { getAdminSignInActivity, SignInActivityItem } from '@/lib/api/admin/users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Card from '@/components/ui/Card';

export default function SignInActivityView() {
  const [activities, setActivities] = useState<SignInActivityItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminSignInActivity({ page, pageSize });
      setActivities(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load sign-in activities.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [page]);

  const filtered = activities.filter((item) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      item.userEmail.toLowerCase().includes(q) ||
      (item.userName && item.userName.toLowerCase().includes(q)) ||
      (item.ipAddress && item.ipAddress.toLowerCase().includes(q))
    );
  });

  const adminCount = activities.filter((a) => a.userRole === 'ADMIN').length;
  const studentCount = activities.filter((a) => a.userRole === 'STUDENT').length;

  return (
    <div className="flex flex-col gap-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Total Sign-in Events</span>
            <Activity className="h-4 w-4 text-primary-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {loading ? '...' : total}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Admin Sign-ins (Current View)</span>
            <Shield className="h-4 w-4 text-purple-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-purple-700 dark:text-purple-400">
            {loading ? '...' : adminCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Student Sign-ins (Current View)</span>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-blue-700 dark:text-blue-400">
            {loading ? '...' : studentCount}
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="flex flex-col gap-5 p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-divider pb-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by email, name or IP..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchActivities}
              disabled={loading}
              className="h-8 gap-1.5 text-xs text-slate-600"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/20 p-4 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        ) : loading ? (
          <div className="py-12 text-center text-xs text-slate-500">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent mb-2" />
            Loading sign-in events...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No sign-in records found.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">User Identity</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Role</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">IP Address</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Device / Browser</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Signed In At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {item.userName || 'Unnamed User'}
                        </span>
                        <span className="text-[11px] text-slate-500">{item.userEmail}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {item.userRole === 'ADMIN' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 dark:bg-purple-950/40 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          <Shield className="h-3 w-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          <UserCheck className="h-3 w-3" />
                          Student
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Globe className="h-3.5 w-3.5 text-slate-400" />
                        <span>{item.ipAddress || '127.0.0.1'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 max-w-xs truncate" title={item.userAgent || ''}>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Laptop className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.userAgent || 'Web Client'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                          {new Date(item.signedInAt).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'medium',
                          })}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-divider pt-4 text-xs text-slate-500">
            <span>
              Page {page} of {totalPages} ({total} events)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 text-xs"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
