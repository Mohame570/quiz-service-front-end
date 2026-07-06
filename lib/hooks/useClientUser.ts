'use client';

import { useSyncExternalStore } from 'react';
import { AUTH_CHANGED_EVENT, getUser } from '@/lib/auth/session';
import type { LoginResponse } from '@/types/user/user';

type User = LoginResponse['user'];

let cachedUser: User | null = null;
let cachedKey: string | undefined;

function userCacheKey(user: User | null): string | undefined {
  if (!user) return undefined;
  return `${user.id}|${user.email}|${user.role}|${user.emailVerified}`;
}

function invalidateUserCache(): void {
  cachedUser = null;
  cachedKey = undefined;
}

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = () => {
    invalidateUserCache();
    onStoreChange();
  };
  window.addEventListener('storage', handler);
  window.addEventListener(AUTH_CHANGED_EVENT, handler);

  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener(AUTH_CHANGED_EVENT, handler);
  };
}

function getSnapshot(): User | null {
  const user = getUser();
  const key = userCacheKey(user);
  if (key === cachedKey) {
    return cachedUser;
  }
  cachedKey = key;
  cachedUser = user;
  return cachedUser;
}

function getServerSnapshot(): User | null {
  return null;
}

export function useClientUser(): User | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function userDisplayName(user: User | null): string {
  return user?.email?.split('@')[0] ?? 'Student';
}
