"use client";

import Link from "next/link";
import { useState } from "react";
import { resendVerification } from "@/lib/api/auth";
import { useClientUser } from "@/lib/hooks/useClientUser";
import Container from "@/components/shared/Container";

export default function VerifyEmailPrompt() {
  const user = useClientUser();
  const email = user?.email;
  const [resendStatus, setResendStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [resendError, setResendError] = useState<string | null>(null);

  async function handleResend() {
    if (!email) return;
    setResendStatus("sending");
    setResendError(null);
    try {
      await resendVerification(email);
      setResendStatus("sent");
    } catch (err) {
      setResendStatus("error");
      setResendError(
        err instanceof Error ? err.message : "Failed to resend verification email.",
      );
    }
  }

  return (
    <Container size="quiz">
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="text-h1 text-foreground">Verify your email</h1>
        <p className="max-w-md text-body text-foreground-secondary">
          You need to verify your email before taking quizzes.
          {email ? ` We sent a link to ${email}.` : ""}
        </p>
        <Link
          href="/verify-email"
          className="mt-2 rounded-full bg-accent-500 px-6 py-3 text-body font-semibold text-inverse hover:bg-accent-600"
        >
          Go to verification page
        </Link>
        {email && (
          <button
            type="button"
            onClick={handleResend}
            disabled={resendStatus === "sending"}
            className="text-small font-semibold text-accent-600 hover:text-accent-700 disabled:opacity-50"
          >
            {resendStatus === "sending"
              ? "Sending..."
              : resendStatus === "sent"
                ? "Verification email sent"
                : "Resend verification email"}
          </button>
        )}
        {resendError && <p className="text-small text-error">{resendError}</p>}
      </div>
    </Container>
  );
}
