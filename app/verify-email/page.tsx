// app/verify-email/page.tsx
//
// Server Component by default (no "use client" here). Kept thin per the
// Next.js docs bundle-size pattern: rendering and interactivity live in
// VerifyEmailClient, this file only wires up the Suspense boundary.
//
// The Suspense boundary here is NOT optional. Per the installed Next.js 16
// docs (use-search-params.md): "During production builds, a static page
// that calls useSearchParams from a Client Component must be wrapped in a
// Suspense boundary, otherwise the build fails." This only shows up in
// `next build`, not `next dev` -- it would look fine locally and then break
// the production build without this.

import { Suspense } from "react";
import VerifyEmailClient from "@/components/verification/VerifyEmailClient";
import VerifyEmailFallback from "@/components/verification/VerifyEmailFallback";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailClient />
    </Suspense>
  );
}