// Displays aggregated email delivery stats as stat cards.

import type { DeliveryStatusCounts } from '@/types/notification/notification';
import { formatCompactNumber } from '@/lib/format';

function MailIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="2" y="4" width="16" height="12" rx="2" />
      <path d="m2 6 8 5 8-5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="10" cy="10" r="8" />
      <path d="m6 10 3 3 5-5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="10" cy="10" r="8" />
      <path d="m7 7 6 6m0-6-6 6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="10" cy="10" r="8" />
      <path d="M10 6v4l3 2" />
    </svg>
  );
}

const STATS_CONFIG = [
  { key: 'total', label: 'Total Emails', icon: <MailIcon />, color: 'text-blue-600' },
  { key: 'sent', label: 'Delivered', icon: <CheckIcon />, color: 'text-green-600' },
  { key: 'failed', label: 'Failed', icon: <XIcon />, color: 'text-red-600' },
  { key: 'pending', label: 'Pending', icon: <ClockIcon />, color: 'text-amber-600' },
] as const;

export default function DeliveryStatsCards({ overall }: { overall?: DeliveryStatusCounts | null }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {STATS_CONFIG.map((stat) => (
        <div
          key={stat.key}
          className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-5"
        >
          <span className={stat.color}>{stat.icon}</span>
          <div>
            <p className="text-sm text-foreground-secondary">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground">
              {formatCompactNumber(overall ? overall[stat.key] : null)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
