"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field, Input, Select, a11y } from "@/components/ui/field";
import { findMealPlan, MEAL_PLANS } from "@/lib/meal-plans";
import type { OnboardingDraft } from "@/lib/onboarding-draft";
import { toNumber } from "@/lib/utils";
import { StepShell } from "./step-shell";

const money = z.preprocess(toNumber, z.number().min(0, "Can't be negative").max(10000, "That seems too high").optional());

const schema = z
  .object({
    meal_plan_name: z.string().min(1, "Pick your meal plan"),
    dining_dollars_balance: money,
    swipes_remaining: z.preprocess(toNumber, z.number().int("Whole number").min(0, "Can't be negative").max(500).optional()),
    weekly_food_budget_usd: money,
  })
  .superRefine((v, ctx) => {
    const plan = findMealPlan(v.meal_plan_name);
    if (plan?.block && v.swipes_remaining === undefined) {
      ctx.addIssue({ code: "custom", path: ["swipes_remaining"], message: "How many swipes do you have left?" });
    }
  });

const GROUPS = ["Freshman", "Upperclass", "Dining dollars only", "None"] as const;

export function StepPlan({
  draft,
  onNext,
  onBack,
  busy,
  submitError,
}: {
  draft: OnboardingDraft;
  onNext: (patch: Partial<OnboardingDraft>) => void;
  onBack: () => void;
  busy: boolean;
  submitError: string | null;
}) {
  const { register, handleSubmit, formState, control } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      meal_plan_name: draft.meal_plan_name ?? "",
      dining_dollars_balance: draft.dining_dollars_balance ?? undefined,
      swipes_remaining: draft.swipes_remaining ?? undefined,
      weekly_food_budget_usd: draft.weekly_food_budget_usd ?? undefined,
    },
  });
  const plan = findMealPlan(useWatch({ control, name: "meal_plan_name" }));
  const hasDiningDollars = plan?.type === "both" || plan?.type === "dining_dollars";
  const e = formState.errors;

  return (
    <StepShell
      title="Meal plan & money"
      subtitle="So we suggest places you can actually pay at."
      formId="step-plan"
      onBack={onBack}
      nextLabel={busy ? "Calculating your targets…" : "See my targets"}
      busy={busy}
    >
      <form
        id="step-plan"
        noValidate
        className="space-y-6"
        onSubmit={handleSubmit((v) => {
          const p = findMealPlan(v.meal_plan_name);
          const dd = p?.type === "both" || p?.type === "dining_dollars";
          onNext({
            meal_plan_name: v.meal_plan_name,
            dining_dollars_balance: dd ? (v.dining_dollars_balance ?? null) : null,
            swipes_remaining: p?.block ? (v.swipes_remaining ?? null) : null,
            weekly_food_budget_usd: v.weekly_food_budget_usd ?? null,
          });
        })}
      >
        <Field id="meal_plan_name" label="Meal plan" error={e.meal_plan_name?.message}>
          <Select {...a11y("meal_plan_name", e.meal_plan_name?.message)} {...register("meal_plan_name")}>
            <option value="" disabled>
              Choose your plan
            </option>
            {GROUPS.map((g) => (
              <optgroup key={g} label={g}>
                {MEAL_PLANS.filter((p) => p.group === g).map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </Select>
        </Field>

        {hasDiningDollars ? (
          <Field id="dining_dollars_balance" label="Dining dollars balance right now ($)" hint="Check the VolCard app. A rough number is fine." error={e.dining_dollars_balance?.message}>
            <Input {...a11y("dining_dollars_balance", e.dining_dollars_balance?.message, true)} type="number" inputMode="decimal" step="0.01" placeholder="0.00" {...register("dining_dollars_balance")} />
          </Field>
        ) : null}

        {plan?.block ? (
          <Field id="swipes_remaining" label="Swipes remaining" error={e.swipes_remaining?.message}>
            <Input {...a11y("swipes_remaining", e.swipes_remaining?.message)} type="number" inputMode="numeric" {...register("swipes_remaining")} />
          </Field>
        ) : null}

        <Field id="weekly_food_budget_usd" label="Weekly off-campus food budget ($, optional)" hint="Groceries, takeout, anything not on your plan." error={e.weekly_food_budget_usd?.message}>
          <Input {...a11y("weekly_food_budget_usd", e.weekly_food_budget_usd?.message, true)} type="number" inputMode="decimal" placeholder="0" {...register("weekly_food_budget_usd")} />
        </Field>

        {submitError ? (
          <p role="alert" className="text-sm text-danger">
            {submitError}
          </p>
        ) : null}
      </form>
    </StepShell>
  );
}
