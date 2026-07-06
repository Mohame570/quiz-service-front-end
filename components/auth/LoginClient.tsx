"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn } from "lucide-react";
import BrandLogo from "@/components/shared/BrandLogo";
import { login } from "@/lib/api/auth";
import { getPostAuthDestination } from "@/lib/auth/redirect";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StatusBanner from "@/components/shared/StatusBanner";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await login(email, password);
      router.push(getPostAuthDestination(response.user, redirect));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
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
                <LogIn className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <h1 className="text-h3 font-semibold text-primary-800">Sign in</h1>
                <p className="text-small text-foreground-secondary">
                  Welcome back — continue your learning
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-surface px-6 py-6">
            {error && <StatusBanner variant="error">{error}</StatusBanner>}

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
                className="h-11 border-0 bg-primary-50/80 ring-1 ring-primary-100/80 transition-shadow focus-visible:border-0 focus-visible:bg-surface focus-visible:ring-2 focus-visible:ring-accent-500/40"
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
                autoComplete="current-password"
                placeholder="Enter your password"
                className="h-11 border-0 bg-primary-50/80 ring-1 ring-primary-100/80 transition-shadow focus-visible:border-0 focus-visible:bg-surface focus-visible:ring-2 focus-visible:ring-accent-500/40"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-1 h-11 w-full rounded-xl bg-primary-800 text-body font-semibold text-white shadow-[0_1px_2px_rgba(15,23,42,0.08),0_4px_12px_rgba(17,46,129,0.25)] transition-all hover:bg-primary-700 hover:shadow-[0_4px_16px_rgba(17,46,129,0.3)]"
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-small text-foreground-secondary">
          Don&apos;t have an account?{" "}
          <Link
            href={
              redirect
                ? `/signup?redirect=${encodeURIComponent(redirect)}`
                : "/signup"
            }
            className="font-semibold text-primary-800 transition-colors hover:text-accent-600"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
