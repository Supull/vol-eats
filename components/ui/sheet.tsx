"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

/**
 * Bottom sheet built on <dialog> (focus trap, Esc to close and inert background for free).
 * Tapping the dimmed backdrop also closes it.
 */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="sheet-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-0 mt-auto w-full max-w-none bg-transparent p-0 backdrop:bg-black/40 open:flex open:justify-center"
    >
      <div className="w-full max-w-(--content-max) rounded-t-lg bg-surface px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3 text-text">
        <div aria-hidden className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="sheet-title" className="font-display text-lg font-bold">
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="-mr-2 -mt-1 flex size-11 items-center justify-center rounded-full text-muted hover:bg-surface-2">
            <X aria-hidden className="size-5" />
          </button>
        </div>
        {open ? children : null}
      </div>
    </dialog>
  );
}
