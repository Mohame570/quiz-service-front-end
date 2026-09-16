'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Send,
  RotateCcw,
  Lock,
  Archive,
  Edit3,
  ListOrdered,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  publishAdminQuiz,
  unpublishAdminQuiz,
  updateAdminQuizStatus,
  archiveAdminQuiz,
} from '@/lib/api/admin/quizzes';
import { QuizData, QuizDetail } from '@/types/quiz/admin';
import { ApiError } from '@/lib/api/client';

type Props = {
  quiz: QuizDetail | QuizData;
  onStatusChange?: (updated: QuizData) => void;
};

export default function QuizStatusActions({ quiz, onStatusChange }: Props) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAction = async (
    actionName: string,
    apiCall: () => Promise<QuizData>,
    successMsg: string
  ) => {
    setLoadingAction(actionName);
    setActionError(null);
    setFeedback(null);
    try {
      const updated = await apiCall();
      setFeedback(successMsg);
      if (onStatusChange) {
        onStatusChange(updated);
      }
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      if (err instanceof ApiError) {
        setActionError(
          typeof err.body === 'object' && err.body && 'message' in err.body
            ? String((err.body as { message: unknown }).message)
            : err.message
        );
      } else {
        setActionError(err instanceof Error ? err.message : 'Action failed.');
      }
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {actionError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {feedback && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {/* Navigation Actions */}
        <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
          <Link href={`/admin/dashboard/edit/${quiz.id}`}>
            <Edit3 className="h-3.5 w-3.5" />
            Edit Metadata
          </Link>
        </Button>

        <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
          <Link href={`/admin/dashboard/edit/${quiz.id}/questions`}>
            <ListOrdered className="h-3.5 w-3.5" />
            Manage Questions
          </Link>
        </Button>

        {/* Status Lifecycle Actions */}
        {quiz.status === 'DRAFT' && (
          <Button
            size="sm"
            className="gap-1.5 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
            disabled={loadingAction !== null}
            onClick={() =>
              handleAction(
                'publish',
                () => publishAdminQuiz(quiz.id),
                'Quiz published successfully and is now active.'
              )
            }
          >
            {loadingAction === 'publish' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Publish Quiz
          </Button>
        )}

        {quiz.status === 'PUBLISHED' && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-amber-300 text-xs text-amber-700 hover:bg-amber-50"
              disabled={loadingAction !== null}
              onClick={() =>
                handleAction(
                  'unpublish',
                  () => unpublishAdminQuiz(quiz.id),
                  'Quiz unpublished back to draft mode.'
                )
              }
            >
              {loadingAction === 'unpublish' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RotateCcw className="h-3.5 w-3.5" />
              )}
              Revert to Draft
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-slate-300 text-xs text-slate-700 hover:bg-slate-100"
              disabled={loadingAction !== null}
              onClick={() =>
                handleAction(
                  'close',
                  () => updateAdminQuizStatus(quiz.id, 'CLOSED'),
                  'Quiz closed for candidate submissions.'
                )
              }
            >
              {loadingAction === 'close' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Lock className="h-3.5 w-3.5" />
              )}
              Close Quiz
            </Button>
          </>
        )}

        {quiz.status === 'CLOSED' && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-emerald-300 text-xs text-emerald-700 hover:bg-emerald-50"
              disabled={loadingAction !== null}
              onClick={() =>
                handleAction(
                  'reopen',
                  () => updateAdminQuizStatus(quiz.id, 'PUBLISHED'),
                  'Quiz reopened for candidate attempts.'
                )
              }
            >
              {loadingAction === 'reopen' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RotateCcw className="h-3.5 w-3.5" />
              )}
              Reopen
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-slate-300 text-xs text-slate-700 hover:bg-slate-100"
              disabled={loadingAction !== null}
              onClick={() =>
                handleAction(
                  'archive',
                  () => archiveAdminQuiz(quiz.id),
                  'Quiz moved to archives.'
                )
              }
            >
              {loadingAction === 'archive' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Archive className="h-3.5 w-3.5" />
              )}
              Archive
            </Button>
          </>
        )}

        {quiz.status === 'ARCHIVED' && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs text-primary-700 hover:bg-primary-50"
            disabled={loadingAction !== null}
            onClick={() =>
              handleAction(
                'restore',
                () => updateAdminQuizStatus(quiz.id, 'DRAFT'),
                'Quiz restored to draft status.'
              )
            }
          >
            {loadingAction === 'restore' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" />
            )}
            Restore to Draft
          </Button>
        )}
      </div>
    </div>
  );
}
