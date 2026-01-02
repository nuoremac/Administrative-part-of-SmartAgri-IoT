"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type Toast = {
  id: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  kind?: "info" | "success" | "error";
  ttlMs?: number;
};

type ToastCtx = {
  push: (t: Omit<Toast, "id">) => void;
};

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const toast: Toast = { id, ttlMs: 4500, kind: "info", ...t };
    setToasts((prev) => [toast, ...prev].slice(0, 4));

    const ttl = toast.ttlMs ?? 4500;
    window.setTimeout(() => remove(id), ttl);
  }, [remove]);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <Ctx.Provider value={value}>
      {children}

      {/* Toast stack */}
      <div className="fixed right-4 top-4 z-[100] flex w-[320px] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="rounded-sm border border-gray-200 bg-white p-3 shadow
                       dark:border-gray-800 dark:bg-[#161b22]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {t.title}
                </p>
                {t.message ? (
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{t.message}</p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => remove(t.id)}
                className="rounded-sm px-2 py-1 text-xs font-semibold text-gray-500 hover:bg-gray-50
                           dark:text-gray-300 dark:hover:bg-[#0d1117]"
                aria-label="Close toast"
              >
                ✕
              </button>
            </div>

            {t.actionLabel && t.onAction ? (
              <button
                type="button"
                onClick={() => {
                  t.onAction?.();
                  remove(t.id);
                }}
                className="mt-3 rounded-sm bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700"
              >
                {t.actionLabel}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
