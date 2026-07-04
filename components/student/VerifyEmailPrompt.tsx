"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail } from "lucide-react";
import { resendVerification } from "@/lib/api/auth";
import { useClientUser } from "@/lib/hooks/useClientUser";
import Container from "@/components/shared/Container";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import SectionTitle from "@/components/shared/SectionTitle";
import StatusBanner from "@/components/shared/StatusBanner";

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
      <div className="flex flex-col gap-6 py-8">
        <Card>
          <div className="border-b border-divider px-6 py-5">
            <SectionTitle icon={<Mail className="h-4 w-4" />} title="Verify your email" />
          </div>
          <div className="flex flex-col items-center gap-4 px-6 py-8 text-center">
            <p className="max-w-md text-body text-foreground-secondary">
              You need to verify your email before taking quizzes.
              {email ? ` We sent a link to ${email}.` : ""}
            </p>
            <Button
              asChild
              className="rounded-full bg-primary-800 px-6 text-white hover:bg-primary-700"
            >
              <Link href="/verify-email">Go to verification page</Link>
            </Button>
            {email && (
              <Button
                type="button"
                variant="outline"
                onClick={handleResend}
                disabled={resendStatus === "sending"}
                className="rounded-full border-primary-200 text-primary-800 hover:bg-primary-50"
              >
                {resendStatus === "sending"
                  ? "Sending..."
                  : resendStatus === "sent"
                    ? "Verification email sent"
                    : "Resend verification email"}
              </Button>
            )}
            {resendStatus === "sent" && (
              <StatusBanner variant="success">Verification email sent.</StatusBanner>
            )}
            {resendError && <StatusBanner variant="error">{resendError}</StatusBanner>}
          </div>
        </Card>
      </div>
    </Container>
  );
}
