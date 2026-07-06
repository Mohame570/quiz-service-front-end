import { cn } from '@/lib/utils';

type QuestionProgressProps = {
  current: number;
  total: number;
  answeredCount: number;
};

export default function QuestionProgress({
  current,
  total,
  answeredCount,
}: QuestionProgressProps) {
  const answeredPercent =
    total > 0
      ? Math.min(100, Math.round((answeredCount / total) * 100))
      : 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-caption text-muted-foreground">
        <span>
          Question <span className="font-semibold text-foreground">{current + 1}</span>{' '}
          of {total}
        </span>
        <span>
          Answered:{' '}
          <span className="font-semibold text-foreground">{answeredCount}</span> / {total}
        </span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={answeredCount}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${answeredCount} of ${total} questions answered`}
        className="h-2 w-full overflow-hidden rounded-full bg-border"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent-500 to-primary-800 transition-all duration-250 ease-out"
          style={{ width: `${answeredPercent}%` }}
        />
      </div>

      <div
        className="flex gap-1.5"
        aria-label={`Question ${current + 1} of ${total}`}
      >
        {Array.from({ length: total }, (_, index) => (
          <div
            key={index}
            aria-hidden
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-200',
              index === current
                ? 'bg-accent-500'
                : index < current
                  ? 'bg-accent-200'
                  : 'bg-border',
            )}
          />
        ))}
      </div>
    </div>
  );
}
