import { Suspense } from 'react';
import ResetPasswordClient from '@/components/auth/ResetPasswordClient';
import AuthPageFallback from '@/components/auth/AuthPageFallback';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthPageFallback />}>
      <ResetPasswordClient />
    </Suspense>
  );
}
