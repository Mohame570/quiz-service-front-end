import {
  ATTEMPT_STATUS_LABELS,
  ATTEMPT_STATUS_STYLES,
  type AttemptStatus,
} from '@/lib/student-attempt-status';

export default function AttemptStatusBadge({ status }: { status: AttemptStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-caption font-semibold ${ATTEMPT_STATUS_STYLES[status]}`}
    >
      {ATTEMPT_STATUS_LABELS[status]}
    </span>
  );
}
