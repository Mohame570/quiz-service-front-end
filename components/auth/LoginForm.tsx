'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { login } from '@/lib/api/auth';
import { getUser } from '@/lib/auth/session';

function isSafeRedirect(path: string | null): path is string {
  return !!path && path.startsWith('/') && !path.startsWith('//');
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      const user = getUser();
      router.push(
        isSafeRedirect(redirect)
          ? redirect
          : user?.role === 'ADMIN'
            ? '/admin/dashboard'
            : '/student',
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent-500">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-inverse"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="8" y1="13" x2="16" y2="13" />
              <line x1="8" y1="17" x2="13" y2="17" />
            </svg>
          </div>
          <h1 className="text-h1 text-foreground">PitIQ</h1>
          <p className="mt-2 text-body text-foreground-secondary">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-small text-error">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-small font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-body text-foreground placeholder:text-muted focus:border-accent-500 focus:outline-2 focus:outline-offset-2 focus:outline-accent-500"
              placeholder="student1@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-small font-medium text-foreground"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-body text-foreground placeholder:text-muted focus:border-accent-500 focus:outline-2 focus:outline-offset-2 focus:outline-accent-500"
              placeholder="password123"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-accent-500 px-6 py-3 text-body font-semibold text-inverse transition-colors duration-150 ease-out hover:bg-accent-600 focus:outline-2 focus:outline-offset-2 focus:outline-accent-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 rounded-xl border border-border bg-surface p-4">
          <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-muted">
            Test Account
          </p>
          <p className="text-small text-foreground-secondary">
            <span className="font-medium text-foreground">Email:</span> student1@example.com
          </p>
          <p className="text-small text-foreground-secondary">
            <span className="font-medium text-foreground">Password:</span> password123
          </p>
        </div>
      </div>
    </div>
  );
}
