import { Suspense } from "react";
import SignupClient from "@/components/auth/SignupClient";
import AuthPageFallback from "@/components/auth/AuthPageFallback";

export default function SignupPage() {
  return (
    <Suspense fallback={<AuthPageFallback />}>
      <SignupClient />
    </Suspense>
  );
}
