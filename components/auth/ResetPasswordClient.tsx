'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { KeyRound, ArrowRight, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import BrandLogo from '@/components/shared/BrandLogo';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resetPassword } from '@/lib/api/auth';
import StatusBanner from '@/components/shared/StatusBanner';

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Missing or invalid reset token. Please request a new password reset link.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to reset password. The link may have expired or already been used.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary-50/50 via-background to-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <BrandLogo variant="full" imageClassName="h-36 max-w-[560px]" />
        </div>

        <Card className="overflow-hidden border-0 p-0 shadow-[0_1px_0_rgba(15,23,42,0.04),0_8px_32px_rgba(15,23,42,0.08)] ring-1 ring-border/70">
          <div className="border-b border-primary-100/80 bg-primary-50/90 px-6 py-5">
            <div className="flex items-center gap-3.5">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-accent-600 shadow-[0_1px_2px_rgba(15,23,42,0.06)] ring-1 ring-border/60">
                <KeyRound className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <h1 className="text-h3 font-semibold text-primary-800">
                  Set New Password
                </h1>
                <p className="text-small text-foreground-secondary">
                  Create a new secure password for your account
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface px-6 py-6">
            {!token ? (
              <div className="flex flex-col gap-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-600">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  Invalid Reset Link
                </h3>
                <p className="text-xs text-foreground-secondary">
                  This password reset link is invalid or incomplete. Please request a new link.
                </p>
                <div className="pt-2">
                  <Link
                    href="/forgot-password"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-primary-700 hover:text-primary-800"
                  >
                    Request new link
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ) : success ? (
              <div className="flex flex-col gap-5 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-semibold text-foreground">
                    Password Reset Complete
                  </h3>
                  <p className="text-xs text-foreground-secondary">
                    Your password has been successfully updated. All active sessions have been invalidated for your security.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    onClick={() => router.push('/login')}
                    className="h-11 w-full rounded-xl bg-primary-800 text-body font-semibold text-white hover:bg-primary-700"
                  >
                    Sign in with new password
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {error && <StatusBanner variant="error">{error}</StatusBanner>}

                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-small font-medium text-foreground">
                    New Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    className="h-11 border-0 bg-primary-50/80 ring-1 ring-primary-100/80 transition-shadow focus-visible:border-0 focus-visible:bg-surface focus-visible:ring-2 focus-visible:ring-accent-500/40"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword" className="text-small font-medium text-foreground">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="Repeat new password"
                    className="h-11 border-0 bg-primary-50/80 ring-1 ring-primary-100/80 transition-shadow focus-visible:border-0 focus-visible:bg-surface focus-visible:ring-2 focus-visible:ring-accent-500/40"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="mt-1 h-11 w-full rounded-xl bg-primary-800 text-body font-semibold text-white shadow-[0_1px_2px_rgba(15,23,42,0.08),0_4px_12px_rgba(17,46,129,0.25)] transition-all hover:bg-primary-700 hover:shadow-[0_4px_16px_rgba(17,46,129,0.3)]"
                >
                  {loading ? 'Updating password...' : 'Update password'}
                </Button>

                <div className="text-center pt-2">
                  <Link
                    href="/login"
                    className="text-xs font-medium text-foreground-secondary hover:text-foreground"
                  >
                    Cancel and return to Sign in
                  </Link>
                </div>
              </form>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
