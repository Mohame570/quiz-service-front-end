import { cn } from '@/lib/utils';

type ResultStatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  className?: string;
};

export default function ResultStatCard({
  icon,
  label,
  value,
  className,
}: ResultStatCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3.5 rounded-2xl border border-border/70 bg-primary-50/60 p-4 ring-1 ring-primary-100/80',
        className,
      )}
    >
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-accent-600 shadow-[0_1px_2px_rgba(15,23,42,0.06)] ring-1 ring-border/60">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-caption font-medium text-foreground-secondary">{label}</p>
        <p className="mt-0.5 whitespace-nowrap text-xl font-bold tabular-nums leading-none text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}
