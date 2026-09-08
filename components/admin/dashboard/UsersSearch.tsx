'use client';

import { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';

const SEARCH_PARAM = 'search';

export default function UsersSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const nextValue = searchParams.get(SEARCH_PARAM) ?? '';
    if (inputRef.current && inputRef.current.value !== nextValue) {
      inputRef.current.value = nextValue;
    }
  }, [searchParams]);

  const updateSearch = (nextValue: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextValue.trim() === '') {
      params.delete(SEARCH_PARAM);
    } else {
      params.set(SEARCH_PARAM, nextValue.trim());
    }
    params.delete('page');

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    updateSearch('');
  };

  const currentSearch = searchParams.get(SEARCH_PARAM) ?? '';

  return (
    <div className="relative w-full max-w-md">
      <label htmlFor="users-search-input" className="sr-only">
        Search users by name or email
      </label>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        id="users-search-input"
        ref={inputRef}
        defaultValue={currentSearch}
        onChange={(event) => {
          const nextValue = event.target.value;
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => updateSearch(nextValue), 300);
        }}
        placeholder="Search by name or email..."
        className="pl-10 pr-9 h-11 rounded-xl bg-surface border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary-500"
      />
      {currentSearch && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
