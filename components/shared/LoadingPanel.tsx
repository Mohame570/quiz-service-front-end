import { Loader2 } from 'lucide-react';

export default function LoadingPanel({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-6 py-16 text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      <span className="text-small">{message}</span>
    </div>
  );
}
