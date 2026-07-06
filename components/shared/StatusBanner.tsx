import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatusBannerProps = {
  variant: 'success' | 'error' | 'warning';
  children: React.ReactNode;
  onRetry?: () => void;
};

const variantStyles = {
  success: 'border-success/30 bg-success/10 text-success',
  error: 'border-error/30 bg-error/10 text-error',
  warning: 'border-warning/30 bg-warning/10 text-warning',
};

const variantIcons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
};

export default function StatusBanner({
  variant,
  children,
  onRetry,
}: StatusBannerProps) {
  const Icon = variantIcons[variant];

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-xl border px-4 py-3 text-small',
        variantStyles[variant],
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span className="flex-1">{children}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 font-medium underline underline-offset-2"
        >
          Retry
        </button>
      )}
    </div>
  );
}
