"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { verifyEmail, resendVerification } from "@/lib/api/auth";
import { getUser, setUserMeta } from "@/lib/auth/session";
import { VERIFICATION_STATUS, type VerificationState } from "@/types/auth";
import Link from "next/link";

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // Lazy initializer: if there's no token at all, the "invalid" state is
  // known synchronously on first render — no need to start as "pending"
  // and then flip state inside an effect. This avoids the
  // react-hooks/set-state-in-effect lint warning for that branch, and
  // also means a token-less visit shows the right state immediately
  // instead of flashing "Verifying..." first.
  const [state, setState] = useState<VerificationState>(() =>
    token
      ? { status: VERIFICATION_STATUS.PENDING }
      : {
          status: VERIFICATION_STATUS.INVALID,
          message: "This verification link is missing a token.",
        },
  );

  // Resend flow has its own small bit of local state, separate from the
  // verification state above — it only matters once we're already in the
  // "invalid" state and the user has asked to fix it.
  const [resendEmail, setResendEmail] = useState("");
  const [resendStatus, setResendStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [resendError, setResendError] = useState<string | null>(null);

  useEffect(() => {
    // Nothing to do if there was never a token — the lazy initializer
    // above already set the correct "invalid" state, and this effect
    // only handles the actual async verification call.
    if (!token) return;

    let cancelled = false;

    verifyEmail(token)
      .then((result) => {
        if (cancelled) return;
        if (result.success) {
          const user = getUser();
          if (user) {
            setUserMeta({
              email: user.email,
              emailVerified: true,
              role: user.role,
            });
          }
          setState({ status: VERIFICATION_STATUS.VERIFIED });
        } else {
          setState({
            status: VERIFICATION_STATUS.INVALID,
            message: "We couldn't verify your email. Please try again.",
          });
        }
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message =
          error instanceof Error
            ? error.message
            : "Something went wrong while verifying your email.";
        setState({ status: VERIFICATION_STATUS.INVALID, message });
      });

    // Guards against setting state after unmount if the user navigates
    // away while the request is still in flight.
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleResend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResendStatus("sending");
    setResendError(null);

    try {
      const a = await resendVerification(resendEmail);
      console.log(a);
      setResendStatus("sent");
    } catch (error: unknown) {
      setResendStatus("error");
      setResendError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-6">
      <div className="w-full max-w-md rounded-[20px] border border-[#E2E8F0] bg-white p-8 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.06)]">
        {state.status === VERIFICATION_STATUS.PENDING && <PendingState />}
        {state.status === VERIFICATION_STATUS.VERIFIED && <VerifiedState />}
        {state.status === VERIFICATION_STATUS.INVALID && (
          <InvalidState
            message={state.message}
            resendEmail={resendEmail}
            onResendEmailChange={setResendEmail}
            resendStatus={resendStatus}
            resendError={resendError}
            onSubmit={handleResend}
          />
        )}
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Pending — Info-style treatment. No existing "Info" status badge example in
// DESIGN.md beyond the semantic color, so this reuses the Status badge
// pattern (10% tint background, solid text) with Accent 500 as Info.
// ---------------------------------------------------------------------------
function PendingState() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: "rgba(67, 130, 223, 0.1)" }} // Accent 500 @ 10%
      >
        <Spinner />
      </div>
      <h1 className="text-[20px] font-semibold leading-7 text-[#0F172A]">
        Verifying your email
      </h1>
      <p className="text-[14px] leading-5 text-[#475569]">
        Hang on a moment while we confirm your verification link.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Verified — Success state. Checkmark icon paired with color per the
// accessibility rule in DESIGN.md section 11 (never color alone).
// ---------------------------------------------------------------------------
function VerifiedState() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }} // Success @ 10%
      >
        <CheckIcon color="#22C55E" />
      </div>
      <h1 className="text-[20px] font-semibold leading-7 text-[#0F172A]">
        Email verified
      </h1>
      <p className="text-[14px] leading-5 text-[#475569]">
        Your email has been confirmed. You can now start solving
        quizzes.
      </p>
      <Link
        href="/login"
        className="mt-2 inline-flex items-center justify-center rounded-full bg-[#4382DF] px-5 py-3 text-[16px] font-semibold text-white transition hover:bg-[#2163C4] active:scale-[0.98]"
      >
        Continue to sign in
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Invalid / expired — Error state, with the resend form built in. The form
// inputs follow DESIGN.md section 6 (Input Fields): white surface, 1px
// Border, Accent 500 focus ring.
// ---------------------------------------------------------------------------
function InvalidState({
  message,
  resendEmail,
  onResendEmailChange,
  resendStatus,
  resendError,
  onSubmit,
}: {
  message: string;
  resendEmail: string;
  onResendEmailChange: (value: string) => void;
  resendStatus: "idle" | "sending" | "sent" | "error";
  resendError: string | null;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }} // Error @ 10%
      >
        <CrossIcon color="#EF4444" />
      </div>
      <h1 className="text-[20px] font-semibold leading-7 text-[#0F172A]">
        Link invalid or expired
      </h1>
      <p className="text-[14px] leading-5 text-[#475569]">{message}</p>

      {resendStatus === "sent" ? (
        <p
          className="w-full rounded-[10px] px-4 py-3 text-[14px] font-medium"
          style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22C55E" }}
        >
          A new verification email is on its way. Check your inbox.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="flex w-full flex-col gap-3">
          <label
            htmlFor="resend-email"
            className="text-left text-[14px] font-medium text-[#0F172A]"
          >
            Resend verification email
          </label>
          <input
            id="resend-email"
            type="email"
            required
            value={resendEmail}
            onChange={(event) => onResendEmailChange(event.target.value)}
            placeholder="you@example.com"
            className="rounded-[10px] border border-[#E2E8F0] bg-white px-3.5 py-3 text-[16px] text-[#0F172A] outline-none focus:border-[#4382DF] focus:ring-2 focus:ring-[#E6ECF4]"
          />
          {resendStatus === "error" && resendError && (
            <p className="text-left text-[14px] text-[#EF4444]">
              {resendError}
            </p>
          )}
          <button
            type="submit"
            disabled={resendStatus === "sending"}
            className="inline-flex items-center justify-center rounded-full bg-[#4382DF] px-5 py-3 text-[16px] font-semibold text-white transition hover:bg-[#2163C4] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resendStatus === "sending" ? "Sending..." : "Resend email"}
          </button>
        </form>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small inline icons/spinner — no icon library installed in this repo yet,
// so these are minimal inline SVGs rather than pulling in a new dependency
// for three icons.
// ---------------------------------------------------------------------------
function Spinner() {
  return (
    <svg
      className="h-6 w-6 animate-spin text-[#4382DF]"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 13l4 4L19 7"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrossIcon({ color }: { color: string }) {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}