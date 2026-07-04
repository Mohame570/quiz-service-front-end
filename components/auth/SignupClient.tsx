"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { register } from "@/lib/api/auth";
import { getPostAuthDestination } from "@/lib/auth/redirect";

export default function SignupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await register(name.trim(), email.trim(), password);
      router.push(getPostAuthDestination(response.user, redirect));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      setError(message);
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
          <p className="mt-2 text-body text-foreground-secondary">
            Create your student account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-small text-error">
              {error}
              {error.toLowerCase().includes("already") && (
                <p className="mt-2">
                  <Link
                    href={
                      redirect
                        ? `/login?redirect=${encodeURIComponent(redirect)}`
                        : "/login"
                    }
                    className="font-semibold underline"
                  >
                    Sign in instead
                  </Link>
                </p>
              )}
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-small font-medium text-foreground"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-body text-foreground placeholder:text-muted focus:border-accent-500 focus:outline-2 focus:outline-offset-2 focus:outline-accent-500"
              placeholder="Your name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-small font-medium text-foreground"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-body text-foreground placeholder:text-muted focus:border-accent-500 focus:outline-2 focus:outline-offset-2 focus:outline-accent-500"
              placeholder="student@example.com"
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
              minLength={8}
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-body text-foreground placeholder:text-muted focus:border-accent-500 focus:outline-2 focus:outline-offset-2 focus:outline-accent-500"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-small font-medium text-foreground"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-body text-foreground placeholder:text-muted focus:border-accent-500 focus:outline-2 focus:outline-offset-2 focus:outline-accent-500"
              placeholder="Repeat your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-accent-500 px-6 py-3 text-body font-semibold text-inverse transition-colors duration-150 ease-out hover:bg-accent-600 focus:outline-2 focus:outline-offset-2 focus:outline-accent-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-small text-foreground-secondary">
          Already have an account?{" "}
          <Link
            href={
              redirect
                ? `/login?redirect=${encodeURIComponent(redirect)}`
                : "/login"
            }
            className="font-semibold text-accent-600 hover:text-accent-700"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
