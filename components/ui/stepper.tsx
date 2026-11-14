"use client";

import { Minus, Plus } from "lucide-react";

/** − value + control with 0.5 steps by default. */
export function Stepper({
  label,
  value,
  onChange,
  min = 0.5,
  max = 10,
  step = 0.5,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  const btn = "flex size-11 items-center justify-center rounded-full border bg-surface disabled:opacity-40";
  return (
    <div role="group" aria-label={label} className="flex items-center gap-4">
      <button type="button" className={btn} aria-label={`Decrease ${label.toLowerCase()}`} disabled={value <= min} onClick={() => onChange(Math.max(min, value - step))}>
        <Minus aria-hidden className="size-4" />
      </button>
      <output aria-live="polite" className="min-w-12 text-center text-xl font-bold tabular-nums">
        {value}
      </output>
      <button type="button" className={btn} aria-label={`Increase ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + step))}>
        <Plus aria-hidden className="size-4" />
      </button>
    </div>
  );
}
