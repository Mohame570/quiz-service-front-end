'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { clearToken } from '@/lib/auth/session';

type SidebarItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: 'Quizzes',
    href: '/admin/dashboard',
    icon: (
      <svg
        viewBox="0 0 20 20"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <rect x="3" y="3" width="14" height="14" rx="2.5" />
        <path d="M7 3v14" />
        <path d="M3 7h14" />
      </svg>
    ),
  },
  {
    label: 'Question Bank',
    href: '/admin/dashboard/questions',
    icon: (
      <svg
        viewBox="0 0 20 20"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <circle cx="10" cy="10" r="7" />
        <path d="M7.8 7.8a2.2 2.2 0 1 1 3.3 1.9c-.7.5-1.1.9-1.1 1.8" />
        <circle cx="10" cy="13.6" r="0.4" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'Analytics',
    href: '#analytics',
    icon: (
      <svg
        viewBox="0 0 20 20"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path d="M4 15.5V9.5" />
        <path d="M9 15.5V4.5" />
        <path d="M14 15.5v-7" />
      </svg>
    ),
  },
  {
    label: 'Notifications',
    href: '/admin/dashboard/notifications',
    icon: (
      <svg
        viewBox="0 0 20 20"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path d="M4 8a6 6 0 0 1 12 0c0 7 3 9 3 9H1s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 1-3.4 0" />
      </svg>
    ),
  },
  {
    label: 'Integrity',
    href: '/admin/dashboard/integrity',
    icon: (
      <svg
        viewBox="0 0 20 20"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path d="M10 1.5 3 4.5v5.5c0 4.5 3 8.8 7 9.5 4-.7 7-5 7-9.5V4.5Z" />
        <path d="m7 10 2 2 4-4" />
      </svg>
    ),
  },
  {
    label: 'Users',
    href: '#users',
    icon: (
      <svg
        viewBox="0 0 20 20"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path d="M13.5 17a4.5 4.5 0 0 0-9 0" />
        <circle cx="9" cy="7" r="3" />
        <path d="M14.5 8.5a2.5 2.5 0 1 0 0-5" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    href: '#settings',
    icon: (
      <svg
        viewBox="0 0 20 20"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path d="M8.25 3.4 6.85 5.8 4.1 6.4l-.1 2.1 2.4 1.1.45 2.85-1.9 1.95 1.45 1.55 2.6-1 2.5 1 1.45-1.55-1.9-1.95.45-2.85 2.4-1.1-.1-2.1-2.75-.6-1.4-2.4-2.35.1Z" />
        <circle cx="10" cy="10" r="2.2" />
      </svg>
    ),
  },
];

function SidebarItemLink({ item, active }: { item: SidebarItem; active: boolean }) {
  const baseClassName =
    'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors duration-150';

  if (item.href.startsWith('#')) {
    return (
      <button
        type="button"
        className={`${baseClassName} text-white/70 hover:bg-white/10 hover:text-white`}
      >
        <span className="grid h-5 w-5 place-items-center text-white/70">{item.icon}</span>
        <span>{item.label}</span>
      </button>
    );
  }

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
      <span>{item.label}</span>
    </Link>
  );
}

export default function AdminSidebar({ userEmail }: { userEmail: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  // Quizzes is only active on the exact dashboard root, not sub-pages
  const isQuizzesActive = pathname === '/admin/dashboard';

  const handleLogout = () => {
    clearToken();
    router.push('/login');
  };

  return (
    <aside className="w-full bg-[#071d64] text-white lg:min-h-[90vh] lg:w-[20%] lg:sticky lg:rounded-3xl lg:my-8 lg:ml-6 lg:min-w-50">
      <div className="flex h-full flex-col gap-6 px-4 py-5 lg:px-3">
        <div className="px-2 pt-1">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">PitlQ</h2>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.22em] text-white/55">
            Admin Dashboard
          </p>
          {userEmail && (
            <p className="mt-3 truncate font-medium text-white" title={userEmail}>
              {userEmail}
            </p>
          )}
        </div>

        <nav aria-label="Admin navigation" className="grid gap-2">
          {SIDEBAR_ITEMS.map((item) => (
            <SidebarItemLink
              key={item.label}
              item={item}
              active={item.href === '/admin/dashboard' ? isQuizzesActive : pathname === item.href}
            />
          ))}
        </nav>

        <Link
          href={`/admin/dashboard/create`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5b8dfc] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4f80f1]"
        >
          <span className="text-lg leading-none">+</span>
          <span>Create New Quiz</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/70 transition-colors duration-150 hover:bg-white/10 hover:text-white mt-auto"
        >
          <span className="grid h-5 w-5 place-items-center text-white/70">
            <LogOut className="h-4 w-4" strokeWidth={1.6} />
          </span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
