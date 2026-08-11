// app/verify-email/VerifyEmailFallback.tsx
//
// Suspense fallback shown before VerifyEmailClient hydrates. Deliberately
// identical markup to the "pending" state inside VerifyEmailClient so there
// is no visible flash/swap once the Client Component takes over -- this
// file has no "use client" directive and renders no hooks, so it's safe to
// render as part of the initial server HTML (the whole point of wrapping
// useSearchParams in Suspense per the Next.js docs).

export default function VerifyEmailFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-6">
      <div className="w-full max-w-md rounded-[20px] border border-[#E2E8F0] bg-white p-8 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(67, 130, 223, 0.1)" }}
          >
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
          </div>
          <h1 className="text-[20px] font-semibold leading-7 text-[#0F172A]">
            Verifying your email
          </h1>
          <p className="text-[14px] leading-5 text-[#475569]">
            Hang on a moment while we confirm your verification link.
          </p>
        </div>
      </div>
    </main>
  );
}