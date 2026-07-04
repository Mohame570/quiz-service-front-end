const INTEGRITY_RULES = [
  {
    id: 'no-refresh',
    icon: '🔄',
    text: 'Do not refresh or close this page. Your progress is saved automatically.',
    severity: 'warning' as const,
  },
  {
    id: 'no-tab-switch',
    icon: '🪟',
    text: 'Do not switch tabs or windows. Tab switching is recorded against your attempt.',
    severity: 'warning' as const,
  },
  {
    id: 'no-external-help',
    icon: '👤',
    text: 'No external help. This is an individual assessment.',
    severity: 'warning' as const,
  },
  {
    id: 'timer-starts',
    icon: '⏱',
    text: 'The timer starts as soon as you click Start and cannot be paused.',
    severity: 'info' as const,
  },
  {
    id: 'no-retake',
    icon: '🔒',
    text: 'You cannot retake the quiz once submitted.',
    severity: 'info' as const,
  },
];

const severityBorder: Record<string, string> = {
  info: 'border-info/30',
  warning: 'border-warning/30',
  danger: 'border-error/30',
};

const severityIcon: Record<string, string> = {
  info: 'bg-info/10 text-info',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-error/10 text-error',
};

export default function QuizRules({ embedded = false }: { embedded?: boolean }) {
  const content = (
    <ul className="flex flex-col gap-2">
      {INTEGRITY_RULES.map((rule) => (
        <li
          key={rule.id}
          className={`flex items-start gap-3 rounded-xl border ${severityBorder[rule.severity]} bg-card px-3 py-2.5 text-small text-foreground`}
        >
          <span
            aria-hidden
            className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-base ${severityIcon[rule.severity]}`}
          >
            {rule.icon}
          </span>
          <span className="leading-relaxed">{rule.text}</span>
        </li>
      ))}
    </ul>
  );

  if (embedded) {
    return (
      <section aria-labelledby="quiz-rules-heading" className="flex flex-col gap-4">
        <p id="quiz-rules-heading" className="text-caption font-medium text-foreground-secondary">
          Integrity rules for this attempt
        </p>
        {content}
      </section>
    );
  }

  return (
    <section
      aria-labelledby="quiz-rules-heading"
      className="flex flex-col gap-4 rounded-[20px] border border-border bg-surface p-5"
    >
      <div>
        <h2 id="quiz-rules-heading" className="text-h3 text-foreground">
          Before you start
        </h2>
        <p className="text-caption text-muted-foreground">Integrity rules for this attempt</p>
      </div>
      {content}
    </section>
  );
}
