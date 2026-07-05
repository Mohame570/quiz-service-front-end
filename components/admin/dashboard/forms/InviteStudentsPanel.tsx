'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Mail, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { ApiError } from '@/lib/api/client';
import { sendQuizInvitations } from '@/lib/api/admin/notifications';
import { invitationEmailSchema } from '@/lib/validation';
import type { SendQuizInvitationResponse } from '@/types/notification/notification';
import FieldError from './FormFieldError';

type EmailChip = { value: string; valid: boolean };

function parseEmails(raw: string): EmailChip[] {
  const tokens = raw
    .split(/[\s,;]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const chips: EmailChip[] = [];
  for (const token of tokens) {
    const key = token.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    chips.push({ value: token, valid: invitationEmailSchema.safeParse(token).success });
  }
  return chips;
}

function InviteStudentsPanel({ quizId, quizTitle }: { quizId: string; quizTitle: string }) {
  const [open, setOpen] = useState(false);
  const [rawInput, setRawInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SendQuizInvitationResponse | null>(null);

  const chips = useMemo(() => parseEmails(rawInput), [rawInput]);
  const validEmails = useMemo(() => chips.filter((c) => c.valid).map((c) => c.value), [chips]);
  const canSubmit = chips.length > 0 && chips.every((c) => c.valid) && !submitting;
  const failedEmails = useMemo(
    () =>
      result
        ? result.results.filter((r) => r.status === 'FAILED').map((r) => r.recipientEmail)
        : [],
    [result]
  );

  const handleOpenChange = (next: boolean) => {
    if (!next && submitting) return;
    if (next) {
      setRawInput('');
      setError(null);
      setResult(null);
    }
    setOpen(next);
  };

  const handleRemoveChip = (value: string) => {
    setRawInput(
      chips
        .filter((c) => c.value !== value)
        .map((c) => c.value)
        .join('\n')
    );
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await sendQuizInvitations({ quizId, recipientEmails: validEmails });
      console.log(response);
      setResult(response);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setError(err.message || 'Can only send invitations for published quizzes.');
      } else {
        setError(
          err instanceof Error ? err.message : 'Failed to send invitations. Please try again.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetryFailed = () => {
    setRawInput(failedEmails.join('\n'));
    setResult(null);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full border-primary-200 text-primary-800 hover:bg-primary-50"
        >
          <Mail className="h-4 w-4" />
          Invite Students
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Students</DialogTitle>
          <DialogDescription>
            Quiz: <span className="font-medium text-foreground">{quizTitle}</span>
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="invite-emails">Recipient emails</Label>
              <Textarea
                id="invite-emails"
                placeholder="Paste or type emails separated by commas, semicolons, or new lines..."
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                disabled={submitting}
              />
            </div>

            {chips.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {chips.map((chip) => (
                  <li
                    key={chip.value}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full border px-3 py-1 text-caption',
                      chip.valid
                        ? 'border-primary-200 bg-primary-50 text-primary-800'
                        : 'border-error/40 bg-error/10 text-error'
                    )}
                  >
                    {chip.value}
                    <button
                      type="button"
                      aria-label={`Remove ${chip.value}`}
                      onClick={() => handleRemoveChip(chip.value)}
                      disabled={submitting}
                      className="rounded-full p-0.5 hover:bg-black/10"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {chips.some((c) => !c.valid) && (
              <FieldError message="Fix or remove the highlighted invalid email(s) before sending." />
            )}
            {error && <FieldError message={error} />}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="rounded-full border-primary-200 text-primary-800 hover:bg-primary-50"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="rounded-full bg-primary-800 px-6 text-white hover:bg-primary-700 disabled:bg-primary-400"
              >
                {submitting
                  ? 'Sending…'
                  : `Send Invitations${validEmails.length ? ` (${validEmails.length})` : ''}`}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-small text-success">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {result.sent} sent, {result.failed} failed.
            </div>

            {failedEmails.length > 0 && (
              <div className="grid gap-2 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-small text-error">
                <p className="font-medium">Failed to deliver to:</p>
                <ul className="list-disc pl-5">
                  {failedEmails.map((email) => (
                    <li key={email}>{email}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-3">
              {failedEmails.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRetryFailed}
                  className="rounded-full border-primary-200 text-primary-800 hover:bg-primary-50"
                >
                  Retry Failed ({failedEmails.length})
                </Button>
              )}
              <Button
                type="button"
                onClick={() => handleOpenChange(false)}
                className="rounded-full bg-primary-800 px-6 text-white hover:bg-primary-700"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default InviteStudentsPanel;
