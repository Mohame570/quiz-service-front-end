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
import SectionTitle from "@/components/shared/SectionTitle";

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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <section
          aria-labelledby="login-welcome"
          className="relative mb-6 overflow-hidden rounded-[20px] bg-gradient-to-br from-primary-800 via-primary-900 to-[#040C24] px-8 py-7 text-inverse shadow-[0_16px_48px_rgba(15,23,42,0.18)]"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 18% 28%, rgba(67, 130, 223, 0.55) 0%, transparent 42%), radial-gradient(circle at 82% 72%, rgba(86, 89, 188, 0.4) 0%, transparent 45%)",
            }}
          />
          <div className="relative flex flex-col items-center gap-4 text-center">
            <BrandLogo variant="mark" imageClassName="h-20 max-w-[140px]" />
            <div className="flex flex-col gap-1">
              <p className="text-h1 font-bold text-inverse">PitIQ</p>
              <p className="text-caption text-inverse-secondary">
                Pause. Assess. Advance.
              </p>
            </div>
            <p id="login-welcome" className="text-body text-inverse-secondary">
              Sign in to continue to your quizzes and dashboard.
            </p>
          </div>
        </section>

        <Card>
          <div className="border-b border-divider px-6 py-5">
            <SectionTitle icon={<LogIn className="h-4 w-4" />} title="Sign in" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 py-6">
            {error && <StatusBanner variant="error">{error}</StatusBanner>}

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-primary-800 py-3 text-body font-semibold text-white hover:bg-primary-700"
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
            className="font-semibold text-primary-800 hover:text-primary-700"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
