'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export type Toast = {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
};

type ToastContextValue = {
  toast: {
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
  };
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toastItem) => toastItem.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, title: string, description?: string) => {
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: Toast = { id, type, title, description };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  const toast = useMemo(
    () => ({
      success: (title: string, description?: string) => addToast('success', title, description),
      error: (title: string, description?: string) => addToast('error', title, description),
      info: (title: string, description?: string) => addToast('info', title, description),
    }),
    [addToast],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast viewport */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2 sm:p-0"
      >
        {toasts.map((toastItem) => (
          <div
            key={toastItem.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl p-4 shadow-xl border backdrop-blur-md transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4 ${
              toastItem.type === 'success'
                ? 'bg-white/95 dark:bg-slate-900/95 border-emerald-200 dark:border-emerald-900/60 text-emerald-950 dark:text-emerald-100 shadow-emerald-500/10'
                : toastItem.type === 'error'
                  ? 'bg-white/95 dark:bg-slate-900/95 border-rose-200 dark:border-rose-900/60 text-rose-950 dark:text-rose-100 shadow-rose-500/10'
                  : 'bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800 text-slate-950 dark:text-slate-100'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toastItem.type === 'success' && (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              )}
              {toastItem.type === 'error' && (
                <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              )}
              {toastItem.type === 'info' && (
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight">{toastItem.title}</p>
              {toastItem.description && (
                <p className="text-xs mt-1 text-slate-600 dark:text-slate-400 leading-normal">
                  {toastItem.description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => removeToast(toastItem.id)}
              className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
