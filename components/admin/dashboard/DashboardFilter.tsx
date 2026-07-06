'use client';

import { QuizFilterOptions } from '@/types/quiz/admin';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const FILTERS: QuizFilterOptions[] = [
  { key: 'all', label: 'All' },
  { key: 'PUBLISHED', label: 'Published' },
  { key: 'DRAFT', label: 'Drafts' },
  { key: 'CLOSED', label: 'Closed' },
  { key: 'ARCHIVED', label: 'Archived' },
];

function DashboardFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');
  const activeFilter = FILTERS.some((filter) => filter.key === statusParam)
    ? (statusParam as QuizFilterOptions['key'])
    : 'all';

  const setFilter = (value: QuizFilterOptions['key']) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete('status');
    } else {
      params.set('status', value);
    }
    params.delete('page');

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  return (
    <div className="w-full max-w-md lg:self-end">
      <div
        className="flex flex-wrap w-full max-w-full gap-1 rounded-2xl border border-border bg-surface/90 p-1"
        role="tablist"
        aria-label="Quiz status filters"
      >
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.key;

          return (
            <button
              key={filter.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={[
                'flex-1 rounded-xl px-4 py-3 text-small font-medium transition-all duration-150 capitalize',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/60 focus-visible:ring-offset-0',
                isActive
                  ? 'bg-primary-800 text-white'
                  : 'text-foreground-secondary hover:bg-primary-50 hover:text-primary-800',
              ].join(' ')}
              onClick={() => {
                setFilter(filter.key);
              }}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DashboardFilter;
