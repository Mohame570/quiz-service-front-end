'use client';

import { useRouter } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import { clearToken } from '@/lib/auth/session';
import BrandLogo from '@/components/shared/BrandLogo';
import { useAdminShell } from '@/components/admin/dashboard/AdminShellProvider';

export default function AdminTopbar({ userEmail }: { userEmail: string | null }) {
  const router = useRouter();
  const { sidebarOpen, toggleSidebar } = useAdminShell();

  const handleLogout = () => {
    clearToken();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-surface/90 shadow-[0_1px_0_rgba(15,23,42,0.04),0_4px_24px_rgba(15,23,42,0.04)] backdrop-blur-md supports-[backdrop-filter]:bg-surface/80">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-foreground-secondary transition-colors duration-150 hover:bg-primary-50 hover:text-primary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 lg:hidden"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Brand logo in topbar */}
        <BrandLogo
          href="/admin/dashboard"
          variant="inverse"
          className="shrink-0"
          imageClassName="h-8 w-auto max-w-[160px] sm:h-9 sm:max-w-[180px]"
        />

        {/* Right side — user info + logout */}
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          {/* User pill */}
          {userEmail && (
            <div className="hidden items-center gap-2.5 rounded-full border border-border/80 bg-primary-50/50 py-1 pl-1 pr-3.5 sm:flex">
              <div
                aria-hidden
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-700 to-primary-900 text-small font-semibold text-inverse shadow-sm"
              >
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[140px] truncate text-small font-medium text-foreground">
                Admin
              </span>
            </div>
          )}

          {/* Logout button */}
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Log out"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-foreground-secondary transition-colors duration-150 ease-out hover:bg-primary-50 hover:text-primary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 sm:h-auto sm:w-auto sm:gap-1.5 sm:px-3 sm:py-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden text-small font-medium sm:inline">Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
