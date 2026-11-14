"use client";

import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Single-select cards (radio group). */
export function ChoiceCards<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  error,
  columns = 1,
}: {
  name: string;
  legend: ReactNode;
  options: { value: T; label: ReactNode; description?: ReactNode }[];
  value: T | undefined;
  onChange: (v: T) => void;
  error?: string;
  columns?: 1 | 2 | 3;
}) {
  return (
    <fieldset className="min-w-0 space-y-2" aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="mb-2 text-sm font-medium">{legend}</legend>
      <div className={cn("grid gap-2", columns === 2 && "grid-cols-2", columns === 3 && "grid-cols-3")}>
        {options.map((o) => {
          const checked = value === o.value;
          return (
            <label
              key={o.value}
              className={cn(
                "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border bg-surface p-3 transition-colors duration-150 has-focus-visible:outline-2 has-focus-visible:outline-primary",
                checked && "border-primary bg-surface-2",
              )}
            >
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={checked}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                  checked && "border-primary bg-primary text-primary-fg",
                )}
              >
                {checked ? <Check className="size-3" /> : null}
              </span>
              <span>
                <span className="block text-sm font-semibold">{o.label}</span>
                {o.description ? <span className="block text-xs text-muted">{o.description}</span> : null}
              </span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p id={`${name}-error`} role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

/** Multi-select chips (checkbox group). */
export function ChipGroup<T extends string>({
  legend,
  hint,
  options,
  value,
  onChange,
}: {
  legend: ReactNode;
  hint?: ReactNode;
  options: { value: T; label: string }[];
  value: T[];
  onChange: (v: T[]) => void;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1 text-sm font-medium">{legend}</legend>
      {hint ? <p className="mb-2 text-xs text-muted">{hint}</p> : null}
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const checked = value.includes(o.value);
          return (
            <label
              key={o.value}
              className={cn(
                "flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border bg-surface px-4 text-sm transition-colors duration-150 has-focus-visible:outline-2 has-focus-visible:outline-primary",
                checked && "border-primary bg-surface-2 font-semibold",
              )}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={() => onChange(checked ? value.filter((v) => v !== o.value) : [...value, o.value])}
              />
              {checked ? <Check aria-hidden className="size-4" /> : null}
              {o.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
