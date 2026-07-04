"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useQuizSearch } from "@/components/shared/QuizSearchProvider";
import { clearToken } from "@/lib/auth/session";

import BrandLogo from "@/components/shared/BrandLogo";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

function HomeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="13" y2="17" />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { label: "Statistics", href: "/student", icon: <HomeIcon /> },
  { label: "My Quizzes", href: "/student/quiz-list", icon: <BookIcon /> },
];

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
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-surface">
      <div className="mx-auto flex h-full max-w-[1200px] items-center gap-6 px-6">
        <BrandLogo href="/student" variant="full" imageClassName="h-12 max-w-[260px]" />

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-small font-semibold transition-all duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 ${
                  isActive
                    ? "bg-gradient-to-b from-accent-500 to-accent-700 text-inverse shadow-[0_1px_2px_rgba(15,23,42,0.08),0_4px_12px_rgba(67,130,223,0.35)]"
                    : "text-foreground-secondary hover:bg-divider hover:text-foreground"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <label className="relative hidden items-center md:flex">
            <span className="sr-only">Search</span>
            <span
              aria-hidden
              className="pointer-events-none absolute left-3 text-foreground-secondary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
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
              placeholder="Search quizzes by title..."
              className="w-64 rounded-full border border-border bg-surface py-1.5 pl-8 pr-12 text-small text-foreground placeholder:text-muted-foreground focus-visible:border-accent-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
            />
            <span className="pointer-events-none absolute right-2 inline-flex items-center gap-0.5 rounded border border-border bg-surface px-1.5 py-0.5 text-caption text-muted-foreground">
              <span aria-hidden>⌘</span>
              <span>K</span>
            </span>
          </label>

          <button
            type="button"
            aria-label="Refresh"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-foreground-secondary transition-colors duration-150 ease-out hover:border-accent-200 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M21 12a9 9 0 1 1-3-6.7" />
              <polyline points="21 4 21 12 13 12" />
            </svg>
          </button>

          <div
            aria-label="User"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-800 text-small font-semibold text-inverse"
          >
            A
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="text-small font-semibold text-foreground-secondary transition-colors duration-150 ease-out hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
