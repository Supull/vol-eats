"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, a11y } from "@/components/ui/field";
import { toNumber } from "@/lib/utils";
import { MEAL_PERIOD_LABELS } from "@/lib/meal-period";
import type { FoodLogInput, LogSource, MealPeriod } from "@/lib/types";

const n = (max: number, label: string) =>
  z.preprocess(toNumber, z.number({ error: `Enter ${label}` }).min(0, "Can't be negative").max(max, "That seems too high"));

const schema = z.object({
  name: z.string().trim().min(1, "Give it a name").max(120),
  servings: z.preprocess(toNumber, z.number({ error: "Enter servings" }).min(0.5, "At least 0.5").max(10, "At most 10").multipleOf(0.5, "Use halves (0.5, 1, 1.5…)")),
  calories: n(5000, "calories"),
  protein_g: n(500, "protein"),
  carbs_g: n(1000, "carbs"),
  fat_g: n(500, "fat"),
  meal_period: z.enum(["breakfast", "lunch", "dinner"]),
});

export interface FoodFormDefaults {
  name?: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
}

/** Name, servings, macros (per serving) and meal. Used by photo log and quick add. */
export function FoodForm({
  idPrefix,
  defaults,
  mealPeriod,
  source,
  submitLabel,
  busy,
  onSubmit,
}: {
  idPrefix: string;
  defaults?: FoodFormDefaults;
  mealPeriod: MealPeriod;
  source: LogSource;
  submitLabel: string;
  busy: boolean;
  onSubmit: (input: FoodLogInput) => void;
}) {
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { servings: 1, meal_period: mealPeriod, ...defaults },
  });
  const e = formState.errors;
  const id = (k: string) => `${idPrefix}-${k}`;
  const err = (k: keyof typeof e) => e[k]?.message as string | undefined;

  const macro = (k: "calories" | "protein_g" | "carbs_g" | "fat_g", label: string) => (
    <Field id={id(k)} label={label} error={err(k)}>
      <Input {...a11y(id(k), err(k))} type="number" inputMode="decimal" {...register(k)} />
    </Field>
  );

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={handleSubmit((v) => onSubmit({ ...v, menu_item_id: null, source }))}
    >
      <Field id={id("name")} label="What did you eat?" error={err("name")}>
        <Input {...a11y(id("name"), err("name"))} placeholder="e.g. Chicken burrito bowl" {...register("name")} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field id={id("servings")} label="Servings" error={err("servings")}>
          <Input {...a11y(id("servings"), err("servings"))} type="number" inputMode="decimal" step="0.5" {...register("servings")} />
        </Field>
        <Field id={id("meal_period")} label="Meal">
          <Select id={id("meal_period")} {...register("meal_period")}>
            {(["breakfast", "lunch", "dinner"] as const).map((p) => (
              <option key={p} value={p}>
                {MEAL_PERIOD_LABELS[p]}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <fieldset className="min-w-0">
        <legend className="mb-1.5 text-sm font-medium">Per serving</legend>
        <div className="grid grid-cols-2 gap-3">
          {macro("calories", "Calories")}
          {macro("protein_g", "Protein (g)")}
          {macro("carbs_g", "Carbs (g)")}
          {macro("fat_g", "Fat (g)")}
        </div>
      </fieldset>
      <Button type="submit" size="lg" block disabled={busy}>
        {busy ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
