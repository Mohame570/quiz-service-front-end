import EmptyPanel from '@/components/shared/EmptyPanel';

type EmptyStateProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
};

export default function EmptyState({
  title = 'No quizzes available yet',
  description = 'Check back later or contact your admin if you believe this is a mistake.',
  action,
}: EmptyStateProps) {
  return <EmptyPanel title={title} description={description} action={action} />;
}
