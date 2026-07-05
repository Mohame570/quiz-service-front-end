'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteAdminQuiz } from '@/lib/api/admin/quizzes';
import InviteStudentsPanel from './forms/InviteStudentsPanel';
import { QuizStatus } from '@/types/quiz/admin';

function QuizCardActions({ id, title, status }: { id: string; title: string; status: QuizStatus }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteAdminQuiz(id);
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete quiz. Please try again.');
    }
  };

  return (
    <>
      <Link
        href={`/admin/dashboard/view/${id}`}
        className="quiz-action-button"
        aria-label={`View ${title}`}
      >
        View
      </Link>
      <Link
        href={`/admin/dashboard/edit/${id}`}
        className="quiz-action-button"
        aria-label={`Edit ${title}`}
      >
        Edit
      </Link>
      {status === 'PUBLISHED' && <InviteStudentsPanel quizId={id} quizTitle={title} />}
      <button
        type="button"
        className="quiz-action-button danger"
        aria-label={`Delete ${title}`}
        onClick={handleDelete}
      >
        Delete
      </button>
    </>
  );
}

export default QuizCardActions;
