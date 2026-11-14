"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Toast {
  id: number;
  message: string;
  tone: "default" | "error";
  action?: { label: string; onClick: () => void };
}

type ShowToast = (message: string, opts?: { tone?: Toast["tone"]; action?: Toast["action"] }) => void;

const ToastContext = createContext<ShowToast | null>(null);

/** One toast at a time, above the tab bar, announced to screen readers. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = useCallback<ShowToast>((message, opts) => {
    clearTimeout(timer.current);
    const id = Date.now();
    setToast({ id, message, tone: opts?.tone ?? "default", action: opts?.action });
    // Toasts with an action (Undo) stay longer so there's time to tap them.
    timer.current = setTimeout(() => setToast((t) => (t?.id === id ? null : t)), opts?.action ? 7000 : 4000);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--tab-bar-height)+env(safe-area-inset-bottom)+12px)] z-50 flex justify-center px-4"
      >
        {toast ? (
          <div
            key={toast.id}
            role={toast.tone === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto flex w-full max-w-(--content-max) items-center justify-between gap-3 rounded-md bg-text px-4 py-3 text-sm text-surface shadow-card",
              toast.tone === "error" && "bg-danger",
            )}
          >
            <span>{toast.message}</span>
            {toast.action ? (
              <button
                type="button"
                className="min-h-11 shrink-0 px-2 font-semibold underline underline-offset-4"
                onClick={() => {
                  toast.action?.onClick();
                  setToast(null);
                }}
              >
                {toast.action.label}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
