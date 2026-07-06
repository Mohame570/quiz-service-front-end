"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserPlus } from "lucide-react";
import BrandLogo from "@/components/shared/BrandLogo";
import { register } from "@/lib/api/auth";
import { getPostAuthDestination } from "@/lib/auth/redirect";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StatusBanner from "@/components/shared/StatusBanner";

const inputClassName =
  "h-11 border-0 bg-primary-50/80 ring-1 ring-primary-100/80 transition-shadow focus-visible:border-0 focus-visible:bg-surface focus-visible:ring-2 focus-visible:ring-accent-500/40";

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

  const loginHref = redirect
    ? `/login?redirect=${encodeURIComponent(redirect)}`
    : "/login";

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
                <UserPlus className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <h1 className="text-h3 font-semibold text-primary-800">
                  Create account
                </h1>
                <p className="text-small text-foreground-secondary">
                  Join PitIQ and start learning
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-surface px-6 py-6">
            {error && (
              <StatusBanner variant="error">
                {error}
                {error.toLowerCase().includes("already") && (
                  <p className="mt-2">
                    <Link
                      href={loginHref}
                      className="font-semibold underline hover:no-underline"
                    >
                      Sign in instead
                    </Link>
                  </p>
                )}
              </StatusBanner>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name" className="text-small font-medium text-foreground">
                Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Your name"
                className={inputClassName}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="text-small font-medium text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className={inputClassName}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="text-small font-medium text-foreground">
                Password
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
                className={inputClassName}
              />
            </div>

            <div className="grid gap-2">
              <Label
                htmlFor="confirmPassword"
                className="text-small font-medium text-foreground"
              >
                Confirm password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Repeat your password"
                className={inputClassName}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-1 h-11 w-full rounded-xl bg-primary-800 text-body font-semibold text-white shadow-[0_1px_2px_rgba(15,23,42,0.08),0_4px_12px_rgba(17,46,129,0.25)] transition-all hover:bg-primary-700 hover:shadow-[0_4px_16px_rgba(17,46,129,0.3)]"
            >
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-small text-foreground-secondary">
          Already have an account?{" "}
          <Link
            href={loginHref}
            className="font-semibold text-primary-800 transition-colors hover:text-accent-600"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
