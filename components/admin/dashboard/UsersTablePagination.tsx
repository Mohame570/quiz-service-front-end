'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export default function UsersTablePagination({
  page,
  totalPages,
  hasNextPage,
  hasPreviousPage,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const goToPage = (n: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(n));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2" aria-label="Users pagination">
      <button
        type="button"
        id="users-prev-page-btn"
        aria-label="Previous page"
        disabled={!hasPreviousPage}
        onClick={() => goToPage(page - 1)}
        className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        <span>Prev</span>
      </button>

      <span
        id="users-current-page-indicator"
        className="inline-flex items-center justify-center min-w-[2rem] h-8 rounded-xl bg-primary-800 text-xs font-semibold text-white px-2.5 shadow-sm"
      >
        {page} / {totalPages || 1}
      </span>

      <button
        type="button"
        id="users-next-page-btn"
        aria-label="Next page"
        disabled={!hasNextPage}
        onClick={() => goToPage(page + 1)}
        className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none"
      >
        <span>Next</span>
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
