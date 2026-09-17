'use client';

import { createContext, useContext, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ToastProvider } from '@/components/ui/toast';

type AdminShellContextValue = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
};

const AdminShellContext = createContext<AdminShellContextValue | null>(null);

export function useAdminShell() {
  const ctx = useContext(AdminShellContext);
  if (!ctx) throw new Error('useAdminShell must be used within AdminShellProvider');
  return ctx;
}

export default function AdminShellProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close sidebar when navigating to a different route on mobile
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setSidebarOpen(false);
  }

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <AdminShellContext value={{ sidebarOpen, setSidebarOpen, toggleSidebar }}>
      <ToastProvider>{children}</ToastProvider>
    </AdminShellContext>
  );
}
