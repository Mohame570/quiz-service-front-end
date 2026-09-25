"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { BookOpen, LayoutDashboard, LogOut, Search, User } from "lucide-react";
import { useQuizSearch } from "@/components/shared/QuizSearchProvider";
import { clearToken } from "@/lib/auth/session";
import BrandLogo from "@/components/shared/BrandLogo";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/student", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "My Quizzes", href: "/student/quiz-list", icon: <BookOpen className="h-4 w-4" /> },
  { label: "Profile", href: "/student/profile", icon: <User className="h-4 w-4" /> },
];

function NavLink({
  item,
  isActive,
  compact = false,
}: {
  item: NavItem;
  isActive: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500",
        compact ? "shrink-0 px-3 py-2 text-small" : "px-3.5 py-2 text-small",
        isActive
          ? "bg-surface text-primary-800 shadow-[0_1px_2px_rgba(15,23,42,0.06)] ring-1 ring-border/80"
          : "text-foreground-secondary hover:bg-surface/60 hover:text-foreground",
      )}
    >
      {item.icon}
      {item.label}
    </Link>
  );
}

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { query, setQuery } = useQuizSearch();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    clearToken();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-surface/90 shadow-[0_1px_0_rgba(15,23,42,0.04),0_4px_24px_rgba(15,23,42,0.04)] backdrop-blur-md supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center gap-4 px-4 sm:px-6 lg:gap-6">
        <BrandLogo
          href="/student"
          variant="full"
          className="shrink-0"
          imageClassName="h-10 w-auto max-w-[200px] sm:h-11 sm:max-w-[240px]"
        />

        <nav
          aria-label="Main navigation"
          className="hidden items-center rounded-xl bg-primary-50/90 p-1 ring-1 ring-primary-100/90 md:flex"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.label}
              item={item}
              isActive={pathname === item.href}
            />
          ))}
        </nav>

        <label className="relative ml-auto hidden min-w-0 flex-1 items-center md:flex md:max-w-xs lg:max-w-sm xl:max-w-md">
          <span className="sr-only">Search quizzes</span>
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground"
          />
          <input
            ref={searchInputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                query.trim() &&
                pathname !== "/student/quiz-list"
              ) {
                router.push("/student/quiz-list");
              }
            }}
            placeholder="Search quizzes..."
            className="w-full rounded-xl border-0 bg-primary-50/80 py-2.5 pl-10 pr-16 text-small text-foreground ring-1 ring-primary-100/80 transition-shadow duration-150 placeholder:text-muted-foreground focus-visible:bg-surface focus-visible:ring-2 focus-visible:ring-accent-500/40 focus-visible:outline-none"
          />
          <kbd className="pointer-events-none absolute right-2.5 hidden items-center gap-0.5 rounded-md border border-border/80 bg-surface px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:inline-flex">
            <span aria-hidden>⌘</span>K
          </kbd>
        </label>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2.5 rounded-full border border-border/80 bg-primary-50/50 py-1 pl-1 pr-3.5 sm:flex">
            <div
              aria-hidden
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-700 to-primary-900 text-small font-semibold text-inverse shadow-sm"
            >
              A
            </div>
            <span className="text-small font-medium text-foreground">Student</span>
          </div>

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

      <nav
        aria-label="Mobile navigation"
        className="flex gap-1 overflow-x-auto border-t border-divider/80 px-4 py-2 md:hidden"
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.label}
            item={item}
            isActive={pathname === item.href}
            compact
          />
        ))}
      </nav>
    </header>
  );
}
