"use client";

import { MEAL_PERIOD_LABELS } from "@/lib/meal-period";
import type { Location, MealPeriod } from "@/lib/types";
import { cn } from "@/lib/utils";

const chip = "flex min-h-11 shrink-0 cursor-pointer items-center rounded-full border bg-surface px-4 text-sm whitespace-nowrap transition-colors duration-150 has-checked:border-text has-checked:bg-text has-checked:text-surface has-focus-visible:outline-2 has-focus-visible:outline-primary";

/** Horizontally scrolling single-select chips for halls and retail spots. */
export function LocationPicker({ locations, value, onChange }: { locations: Location[]; value: string; onChange: (id: string) => void }) {
  return (
    // min-w-0: fieldsets default to min-width: min-content, which would stretch the page instead of scrolling the chips.
    <fieldset className="min-w-0">
      <legend className="sr-only">Where</legend>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {locations.map((l) => (
          <label key={l.id} className={chip}>
            <input type="radio" name="location" className="sr-only" checked={value === l.id} onChange={() => onChange(l.id)} />
            {l.name.replace(" Dining Hall", "")}
            {l.kind === "retail" ? <span className="ml-1.5 text-xs opacity-70">$</span> : null}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Breakfast / Lunch / Dinner segmented control. */
export function PeriodPicker({ value, onChange, disabled }: { value: MealPeriod; onChange: (p: MealPeriod) => void; disabled?: boolean }) {
  return (
    <fieldset disabled={disabled} className={cn(disabled && "opacity-50")}>
      <legend className="sr-only">Meal</legend>
      <div className="grid grid-cols-3 rounded-md border bg-surface p-1">
        {(["breakfast", "lunch", "dinner"] as const).map((p) => (
          <label
            key={p}
            className="flex min-h-10 cursor-pointer items-center justify-center rounded-sm text-sm text-muted transition-colors duration-150 has-checked:bg-surface-2 has-checked:font-semibold has-checked:text-text has-focus-visible:outline-2 has-focus-visible:outline-primary"
          >
            <input type="radio" name="period" className="sr-only" checked={value === p} onChange={() => onChange(p)} />
            {MEAL_PERIOD_LABELS[p]}
          </label>
        ))}
      </div>
      {disabled ? <p className="mt-1 text-xs text-muted">Same menu all day</p> : null}
    </fieldset>
  );
}
