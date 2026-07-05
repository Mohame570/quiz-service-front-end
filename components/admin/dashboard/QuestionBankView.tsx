'use client';

import { useState } from 'react';
import CreateQuestionForm from './forms/CreateQuestionForm';
import { QuestionDto, QuestionType } from '@/types/question/question';

const TYPE_LABELS: Record<QuestionType, string> = {
  MCQ: 'Multiple Choice',
  TRUE_FALSE: 'True / False',
  SHORT_TEXT: 'Short Text',
  ESSAY: 'Essay',
};

export default function QuestionBankView({
  initialQuestions,
}: {
  initialQuestions: QuestionDto[];
}) {
  const [questions, setQuestions] = useState<QuestionDto[]>(initialQuestions);

  return (
    <div className="flex flex-col gap-6">
      <CreateQuestionForm
        defaultOpen
        onCreated={(question) => setQuestions((prev) => [question, ...prev])}
      />

      <h2 className="text-h3 font-semibold text-foreground">
        All Questions
        <span className="ml-2 text-sm font-normal text-foreground-secondary">
          ({questions.length})
        </span>
      </h2>

      {questions.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-body text-foreground-secondary">
            No questions yet. Create the first one above.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-4 py-3 font-medium text-foreground-secondary">Question</th>
                <th className="px-4 py-3 font-medium text-foreground-secondary">Type</th>
                <th className="px-4 py-3 font-medium text-foreground-secondary">Points</th>
                <th className="px-4 py-3 font-medium text-foreground-secondary">Attached Quizzes</th>
                <th className="px-4 py-3 font-medium text-foreground-secondary">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {questions.map((q) => (
                <tr key={q.id} className="transition-colors hover:bg-muted/30">
                  <td className="max-w-md truncate px-4 py-3 font-medium text-foreground">{q.text}</td>
                  <td className="px-4 py-3 text-foreground-secondary">{TYPE_LABELS[q.type]}</td>
                  <td className="px-4 py-3 text-foreground-secondary">{q.points}</td>
                  <td className="px-4 py-3 text-foreground-secondary">{q.quizzes.length}</td>
                  <td className="px-4 py-3 text-xs text-foreground-secondary">
                    {new Date(q.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
