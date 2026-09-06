'use client';

// Client component that fetches email delivery summary and invitation
// status from the admin notifications API. Auth tokens are sent from
// the browser (localStorage), matching the integrity page pattern.
//
// Edge states handled:
//   - Loading: spinner while data fetches
//   - Network error: backend unreachable message
//   - Auth error (403): non-admin access denied
//   - Partial failure: stats loaded but invitations failed (or vice versa)
//   - Empty: no data yet
//   - Data: full dashboard
//
// Consumed by: app/admin/dashboard/notifications/page.tsx

import { useState, useEffect } from 'react';
import DeliveryStatsCards from '@/components/admin/dashboard/DeliveryStatsCards';
import InvitationStatusTable from '@/components/admin/dashboard/InvitationStatusTable';
import { getDeliverySummary, getInvitationStatus } from '@/lib/api/admin/notifications';
import type { DeliverySummary, InvitationStatus } from '@/types/notification/notification';
import { ApiError } from '@/lib/api/client';

export default function NotificationsDashboardView() {
  const [summary, setSummary] = useState<DeliverySummary | null>(null);
  const [invitations, setInvitations] = useState<InvitationStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [invitationError, setInvitationError] = useState<string | null>(null);
  const [networkDown, setNetworkDown] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setSummaryError(null);
      setInvitationError(null);
      setNetworkDown(false);

      let isNetworkDown = false;

      // Fetch both independently so partial data still renders
      const results = await Promise.allSettled([
        getDeliverySummary(),
        getInvitationStatus(),
      ]);

      if (cancelled) return;

      if (results[0].status === 'fulfilled') {
        setSummary(results[0].value);
      } else {
        const err = results[0].reason;
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          isNetworkDown = true;
          setNetworkDown(true);
        } else if(err instanceof ApiError && err.status === 403) {
          setSummaryError('Access denied. Please sign in as an admin.');
        } else {
          setSummaryError(err instanceof Error ? err.message : 'Failed to load delivery summary.');
        }
      }

      if (results[1].status === 'fulfilled') {
        setInvitations(results[1].value);
      } else {
        const err = results[1].reason;
        if (!isNetworkDown) {
          setInvitationError(err instanceof Error ? err.message : 'Failed to load invitation data.');
        }
      }

      setLoading(false);
    }

    fetchData();
    return () => { cancelled = true; };
  }, [retry]);

  // ── Network down (backend unreachable) ──
  if (networkDown && !loading) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
        <p className="text-sm font-medium text-amber-700">Backend unreachable</p>
        <p className="mt-1 text-xs text-amber-600">
          Cannot connect to the API server. Ensure Docker is running and the backend is up on port 3002.
        </p>
        <button
          onClick={() => setRetry(c => c + 1)}
          className="mt-3 text-sm font-medium text-amber-700 underline hover:text-amber-800"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-3 text-sm text-foreground-secondary">Loading delivery data...</p>
      </div>
    );
  }

  // ── Both failed ──
  if (summaryError && invitationError && !summary) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-medium text-red-700">Failed to load delivery data</p>
        <p className="mt-1 text-xs text-red-600">{summaryError}</p>
        <button
          onClick={() => setRetry(c => c + 1)}
          className="mt-3 text-sm font-medium text-red-700 underline hover:text-red-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Delivery stats — show even if invitations fail */}
      {summaryError && (
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-center">
          <p className="text-xs text-warning">Delivery stats unavailable: {summaryError} — displaying fallback values.</p>
        </div>
      )}
      <DeliveryStatsCards overall={summary?.overall} />

      {/* Invitation status — show even if stats fail */}
      {invitationError ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
          <p className="text-sm text-amber-700">Invitation data unavailable: {invitationError}</p>
          <button
            onClick={() => setRetry(c => c + 1)}
            className="mt-2 text-xs font-medium text-amber-700 underline hover:text-amber-800"
          >
            Retry
          </button>
        </div>
      ) : (
        <InvitationStatusTable invitations={invitations} />
      )}
    </>
  );
}
