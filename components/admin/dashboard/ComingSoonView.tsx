import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

type ComingSoonViewProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  status?: 'In Development' | 'Planned';
};

export default function ComingSoonView({
  icon: Icon,
  title,
  description,
  status = 'Planned',
}: ComingSoonViewProps) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-primary-50/40 px-6 py-20 text-center">
      <div className="flex flex-col items-center gap-5">
        {/* Icon circle */}
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-500/12 text-accent-600">
          <Icon className="h-8 w-8" strokeWidth={1.5} />
        </div>

        {/* Status badge */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-support-100 px-3 py-1 text-caption font-medium uppercase tracking-wide text-support-800">
          <span className="h-1.5 w-1.5 rounded-full bg-support-500" aria-hidden />
          {status}
        </span>

        {/* Title & description */}
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-h2 text-foreground">{title}</h2>
          <p className="max-w-md text-body text-foreground-secondary">{description}</p>
        </div>

        {/* Back link */}
        <Link
          href="/admin/dashboard"
          className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-5 py-2.5 text-small font-medium text-foreground-secondary transition-colors duration-150 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
