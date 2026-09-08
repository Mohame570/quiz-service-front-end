'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserCheck, UserX, Loader2, Shield, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { updateAdminUserStatus } from '@/lib/api/admin/users';
import { AdminUser } from '@/types/user/admin-user';

type Props = {
  user: AdminUser;
};

export default function UserStatusToggle({ user }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isStudent = user.role === 'STUDENT';
  const nextStatus = !user.isActive;

  if (!isStudent) {
    return (
      <span
        id={`user-protected-badge-${user.id}`}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-default"
        title="Admin accounts cannot be deactivated"
      >
        <Shield className="h-3.5 w-3.5" />
        Protected
      </span>
    );
  }

  const handleToggle = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await updateAdminUserStatus(user.id, nextStatus);
      setIsOpen(false);
      router.refresh();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to update account status. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {user.isActive ? (
        <button
          type="button"
          id={`deactivate-user-btn-${user.id}`}
          onClick={() => {
            setErrorMessage(null);
            setIsOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-950/70 border border-rose-200 dark:border-rose-900/50 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          aria-label={`Deactivate student account for ${user.email}`}
        >
          <UserX className="h-3.5 w-3.5" />
          <span>Deactivate</span>
        </button>
      ) : (
        <button
          type="button"
          id={`reactivate-user-btn-${user.id}`}
          onClick={() => {
            setErrorMessage(null);
            setIsOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-900/50 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          aria-label={`Reactivate student account for ${user.email}`}
        >
          <UserCheck className="h-3.5 w-3.5" />
          <span>Reactivate</span>
        </button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="sm:max-w-md bg-white dark:bg-slate-900 border-border shadow-2xl rounded-2xl p-6"
          showCloseButton={!isLoading}
        >
          <DialogHeader className="gap-2">
            <div className="flex items-center gap-3">
              <div
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                  nextStatus
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                }`}
              >
                {nextStatus ? (
                  <UserCheck className="h-5 w-5" />
                ) : (
                  <AlertTriangle className="h-5 w-5" />
                )}
              </div>
              <DialogTitle className="text-lg font-bold text-foreground">
                {nextStatus
                  ? 'Reactivate Student Account'
                  : 'Deactivate Student Account'}
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-foreground-secondary leading-relaxed pt-2">
              {nextStatus ? (
                <>
                  Are you sure you want to reactivate the account for{' '}
                  <strong className="text-foreground font-semibold">
                    {user.email}
                  </strong>
                  ? The student will immediately regain access to log in, view quizzes, and submit attempts.
                </>
              ) : (
                <>
                  Are you sure you want to deactivate the account for{' '}
                  <strong className="text-foreground font-semibold">
                    {user.email}
                  </strong>
                  ? The student will immediately be blocked from logging in or taking quizzes until reactivated.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {errorMessage && (
            <div
              id="status-toggle-error"
              className="mt-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 p-3 text-xs text-rose-700 dark:text-rose-400"
              role="alert"
            >
              {errorMessage}
            </div>
          )}

          <div className="mt-5 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              id="cancel-status-toggle-btn"
              disabled={isLoading}
              onClick={() => setIsOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-foreground-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              id="confirm-status-toggle-btn"
              disabled={isLoading}
              onClick={handleToggle}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all focus:outline-none disabled:opacity-50 ${
                nextStatus
                  ? 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500'
                  : 'bg-rose-600 hover:bg-rose-700 focus-visible:ring-2 focus-visible:ring-rose-500'
              }`}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>
                {isLoading
                  ? 'Updating...'
                  : nextStatus
                    ? 'Confirm Reactivation'
                    : 'Confirm Deactivation'}
              </span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
