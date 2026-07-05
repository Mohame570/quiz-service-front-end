import { Suspense } from 'react';
import InvitationClient from '@/components/invitation/InvitationClient';

type InvitationPageProps = {
  params: Promise<{ quizId: string }>;
};

export default async function InvitationPage({ params }: InvitationPageProps) {
  const { quizId } = await params;

  return (
    <Suspense fallback={null}>
      <InvitationClient quizId={quizId} />
    </Suspense>
  );
}
