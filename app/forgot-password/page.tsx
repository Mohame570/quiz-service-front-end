'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import BrandLogo from '@/components/shared/BrandLogo';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { forgotPassword } from '@/lib/api/auth';
import StatusBanner from '@/components/shared/StatusBanner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      setMessage(res.message);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to process request.');
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
                <Mail className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <h1 className="text-h3 font-semibold text-primary-800">
                  Reset Password
                </h1>
                <p className="text-small text-foreground-secondary">
                  Recover access to your PitIQ account
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface px-6 py-6">
            {submitted ? (
              <div className="flex flex-col gap-5 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-foreground">
                    Check your inbox
                  </h3>
                  <p className="text-xs text-foreground-secondary leading-relaxed">
                    {message}
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-primary-700 hover:text-primary-800"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Return to Sign in
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {error && <StatusBanner variant="error">{error}</StatusBanner>}

                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-small font-medium text-foreground">
                    Account Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="h-11 border-0 bg-primary-50/80 ring-1 ring-primary-100/80 transition-shadow focus-visible:border-0 focus-visible:bg-surface focus-visible:ring-2 focus-visible:ring-accent-500/40"
                  />
                  <p className="text-[11px] text-foreground-secondary">
                    Enter the email address registered with your account to receive password reset instructions.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="mt-1 h-11 w-full rounded-xl bg-primary-800 text-body font-semibold text-white shadow-[0_1px_2px_rgba(15,23,42,0.08),0_4px_12px_rgba(17,46,129,0.25)] transition-all hover:bg-primary-700 hover:shadow-[0_4px_16px_rgba(17,46,129,0.3)]"
                >
                  {loading ? 'Sending link...' : 'Send reset link'}
                </Button>

                <div className="text-center pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground-secondary hover:text-foreground"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Sign in
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
