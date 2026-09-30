'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileQuestion,
  BarChart3,
  ClipboardList,
  Bell,
  ShieldCheck,
  Users,
  Settings,
  Activity,
} from 'lucide-react';
import { useAdminShell } from '@/components/admin/dashboard/AdminShellProvider';

type SidebarItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
};

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: 'Quizzes',
    href: '/admin/dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    label: 'Question Bank',
    href: '/admin/dashboard/questions',
    icon: <FileQuestion className="h-4 w-4" />,
  },
  {
    label: 'Analytics',
    href: '/admin/dashboard/analytics',
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    label: 'Follow-up',
    href: '/admin/dashboard/follow-up',
    icon: (
      <svg
        viewBox="0 0 20 20"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path d="M10 6v4l2.5 2.5" />
        <circle cx="10" cy="10" r="7.2" />
      </svg>
    ),
  },
  {
    label: 'Notifications',
    href: '/admin/dashboard/notifications',
    icon: <Bell className="h-4 w-4" />,
  },
  {
    label: 'Integrity',
    href: '/admin/dashboard/integrity',
    icon: <ShieldCheck className="h-4 w-4" />,
  },
  {
    label: 'Users',
    href: '/admin/dashboard/users',
    icon: <Users className="h-4 w-4" />,
  },
  {
    label: 'Sign-In Activity',
    href: '/admin/dashboard/sign-in-activity',
    icon: <Activity className="h-4 w-4" />,
  },
  {
    label: 'Settings',
    href: '/admin/dashboard/settings',
    icon: <Settings className="h-4 w-4" />,
  },
];

function isActive(pathname: string, href: string): boolean {
  // Other dashboard sub-routes have their own sidebar items — don't let them highlight Quizzes
  if (href === '/admin/dashboard') {
    return (
      pathname === '/admin/dashboard' ||
      pathname.startsWith('/admin/dashboard/create') ||
      pathname.startsWith('/admin/dashboard/edit/') ||
      pathname.startsWith('/admin/dashboard/view/')
    );
  }
  return pathname === href || pathname.startsWith(href + '/');
}

function SidebarItemLink({
  item,
  active,
}: {
  item: SidebarItem;
  active: boolean;
}) {
  const baseClassName =
    'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors duration-150';

  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={[
        baseClassName,
        active
          ? 'bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
          : 'text-white/70 hover:bg-white/10 hover:text-white',
      ].join(' ')}
    >
      <span
        className={`grid h-5 w-5 place-items-center ${active ? 'text-white' : 'text-white/70'}`}
      >
        {item.icon}
      </span>
      <span className="flex-1">{item.label}</span>
      {item.comingSoon && (
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/50">
          Soon
        </span>
      )}
    </Link>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useAdminShell();

  const sidebarContent = (
    <div className="flex h-full flex-col gap-6 px-4 py-5 lg:px-3">
      {/* Header */}
      <div className="px-2 pt-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/55">
          Admin Console
        </p>
      </div>

      {/* Navigation */}
      <nav aria-label="Admin navigation" className="grid gap-1">
        {SIDEBAR_ITEMS.map((item) => (
          <SidebarItemLink
            key={item.label}
            item={item}
            active={isActive(pathname, item.href)}
          />
        ))}
      </nav>

      {/* Create Quiz CTA */}
      <Link
        href="/admin/dashboard/create"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-600 active:bg-accent-700"
      >
        <span className="text-lg leading-none">+</span>
        <span>Create New Quiz</span>
      </Link>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <aside className="hidden bg-gradient-to-b from-primary-800 to-primary-900 text-white lg:sticky lg:top-16 lg:block lg:h-[calc(100vh-4rem)] lg:w-60 lg:shrink-0 lg:overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile drawer overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
          {/* Drawer */}
          <aside className="absolute inset-y-0 left-0 w-72 bg-gradient-to-b from-primary-800 to-primary-900 text-white shadow-[16px_0_48px_rgba(15,23,42,0.25)]">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
