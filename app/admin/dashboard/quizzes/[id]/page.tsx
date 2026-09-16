import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function QuizDetailPage({ params }: Props) {
  const { id } = await params;
  redirect(`/admin/dashboard/view/${id}`);
}
