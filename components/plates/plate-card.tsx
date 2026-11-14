"use client";

import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Macros, Plate } from "@/lib/types";
import { cn } from "@/lib/utils";

const BARS = [
  { key: "protein_g", label: "Protein", color: "bg-protein" },
  { key: "carbs_g", label: "Carbs", color: "bg-carbs" },
  { key: "fat_g", label: "Fat", color: "bg-fat" },
] as const;

export function PlateCard({
  plate,
  locationName,
  remaining,
  onLog,
  logging,
  disabled,
}: {
  plate: Plate;
  locationName: string;
  remaining: Macros;
  onLog: () => void;
  logging: boolean;
  disabled: boolean;
}) {
  const t = plate.totals;
  const calOver = t.calories > remaining.calories;

  return (
    <article aria-labelledby={`${plate.id}-title`} className="rounded-lg border bg-surface p-4 shadow-card">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 id={`${plate.id}-title`} className="font-display text-lg font-bold">
            {plate.title}
          </h2>
          <p className="text-xs text-muted">{locationName}</p>
        </div>
        <p className="text-right">
          <span className="block text-xl font-bold tabular-nums">{Math.round(t.calories)}</span>
          <span className={cn("text-xs", calOver ? "text-warning" : "text-muted")}>
            cal {calOver ? `· ${Math.round(t.calories - remaining.calories)} over` : `of ${Math.round(remaining.calories)} left`}
          </span>
        </p>
      </header>

      <ul className="mt-3 space-y-1 text-sm">
        {plate.items.map((i) => (
          <li key={i.menu_item_id} className="flex justify-between gap-3">
            <span>
              {i.servings !== 1 ? <span className="font-semibold">{i.servings} × </span> : null}
              {i.name}
            </span>
            <span className="shrink-0 tabular-nums text-muted">{Math.round(i.calories * i.servings)} cal</span>
          </li>
        ))}
      </ul>

      <ul aria-label="Plate macros vs what's left today" className="mt-4 space-y-2">
        {BARS.map((b) => {
          const value = t[b.key];
          const left = remaining[b.key];
          const pct = left > 0 ? Math.min(1, value / left) : 1;
          const over = value > left;
          return (
            <li key={b.key}>
              <div className="flex justify-between text-xs">
                <span className="font-medium">{b.label}</span>
                <span className={cn("tabular-nums", over ? "text-warning" : "text-muted")}>
                  {Math.round(value)} g of {Math.round(left)} g left{over ? " (over)" : ""}
                </span>
              </div>
              <div aria-hidden className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div className={cn("h-full rounded-full", b.color)} style={{ width: `${pct * 100}%` }} />
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 flex gap-1.5 text-sm text-muted">
        <Sparkles aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
        {plate.reason}
      </p>

      <Button block className="mt-4" onClick={onLog} disabled={disabled}>
        {logging ? (
          "Logging…"
        ) : (
          <>
            <Check aria-hidden className="size-4" /> Log this plate
          </>
        )}
      </Button>
    </article>
  );
}

export function PlateCardSkeleton() {
  return (
    <div aria-hidden className="space-y-3 rounded-lg border bg-surface p-4">
      <div className="flex justify-between">
        <div className="h-5 w-40 animate-pulse rounded-sm bg-surface-2" />
        <div className="h-6 w-12 animate-pulse rounded-sm bg-surface-2" />
      </div>
      <div className="h-3.5 w-3/4 animate-pulse rounded-sm bg-surface-2" />
      <div className="h-3.5 w-2/3 animate-pulse rounded-sm bg-surface-2" />
      <div className="h-1.5 animate-pulse rounded-full bg-surface-2" />
      <div className="h-1.5 animate-pulse rounded-full bg-surface-2" />
      <div className="h-11 animate-pulse rounded-md bg-surface-2" />
    </div>
  );
}
