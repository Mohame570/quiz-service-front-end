'use client';

// components/admin/dashboard/analytics/AnalyticsTabs.tsx

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { label: 'Overview', href: '/admin/dashboard/analytics' },
  { label: 'Question quality', href: '/admin/dashboard/analytics/quality' },
  { label: 'Cohort distribution', href: '/admin/dashboard/analytics/distribution' },
];

export default function AnalyticsTabs() {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 border-b border-border">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              active
                ? 'border-b-2 border-primary-600 text-primary-700'
                : 'text-foreground-secondary hover:text-foreground'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
