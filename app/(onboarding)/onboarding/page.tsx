"use client";

import { Suspense, use, useEffect, useState } from "react";
import { browser } from "react-dom";
import { useRouter } from "next/navigation";
import { StepBody } from "@/components/onboarding/step-body";
import { StepDiet } from "@/components/onboarding/step-diet";
import { StepGoal } from "@/components/onboarding/step-goal";
import { StepPlan } from "@/components/onboarding/step-plan";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import { findMealPlan } from "@/lib/meal-plans";
import { clearDraft, loadDraft, saveDraft, type OnboardingDraft } from "@/lib/onboarding-draft";
import { getSession } from "@/lib/session";
import type { ProfileInput } from "@/lib/types";
import { SCHOOL } from "@/mock/locations";

const STEPS = 4;

function toProfileInput(d: OnboardingDraft, email: string): ProfileInput {
  const plan = findMealPlan(d.meal_plan_name);
  return {
    email,
    display_name: null,
    school_id: SCHOOL.id, // TODO(schema): single-school for the hackathon
    goal_type: d.goal_type ?? "maintain",
    goal_text: d.goal_text?.trim() || null,
    sex: d.sex ?? "unspecified",
    age: d.age!,
    height_cm: d.height_cm!,
    weight_kg: d.weight_kg!,
    goal_weight_kg: d.goal_weight_kg!,
    activity_level: d.activity_level ?? "light",
    diet_tags: d.diet_tags,
    allergens: d.allergens,
    meal_plan_name: d.meal_plan_name ?? null,
    meal_plan_type: plan?.type ?? "none",
    dining_dollars_balance: d.dining_dollars_balance ?? null,
    swipes_remaining: d.swipes_remaining ?? null,
    weekly_food_budget_usd: d.weekly_food_budget_usd ?? null,
  };
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<WizardSkeleton />}>
      <Wizard />
    </Suspense>
  );
}

function WizardSkeleton() {
  return (
    <div className="space-y-4 pt-4" aria-busy="true">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
    </div>
  );
}

function Wizard() {
  // The draft lives in localStorage, so this renders in the browser only.
  use(browser("The onboarding draft is stored in localStorage."));
  const router = useRouter();
  const [draft, setDraft] = useState<OnboardingDraft>(loadDraft);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!getSession()) router.replace("/login");
  }, [router]);

  function update(patch: Partial<OnboardingDraft>) {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      saveDraft(next);
      return next;
    });
    window.scrollTo({ top: 0 });
  }

  async function finish(patch: Partial<OnboardingDraft>) {
    const session = getSession();
    if (!session) return;
    const full = { ...draft, ...patch };
    update(patch);
    setBusy(true);
    setSubmitError(null);
    try {
      await api.saveProfile(toProfileInput(full, session.email));
      clearDraft();
      router.push("/onboarding/targets");
    } catch (e) {
      setSubmitError(errorMessage(e));
      setBusy(false);
    }
  }

  const step = Math.min(draft.step, STEPS - 1);
  const go = (to: number) => (patch: Partial<OnboardingDraft> = {}) => update({ ...patch, step: to });

  return (
    <>
      <div className="pb-6">
        <p className="text-xs font-medium text-muted">
          Step {step + 1} of {STEPS}
        </p>
        <div
          role="progressbar"
          aria-label="Onboarding progress"
          aria-valuemin={1}
          aria-valuemax={STEPS}
          aria-valuenow={step + 1}
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2"
        >
          <div className="h-full rounded-full bg-primary transition-[width] duration-200" style={{ width: `${((step + 1) / STEPS) * 100}%` }} />
        </div>
      </div>

      {step === 0 && <StepGoal draft={draft} onNext={go(1)} />}
      {step === 1 && <StepBody draft={draft} onNext={go(2)} onBack={() => go(0)()} />}
      {step === 2 && <StepDiet draft={draft} onNext={go(3)} onBack={() => go(1)()} />}
      {step === 3 && <StepPlan draft={draft} onNext={finish} onBack={() => go(2)()} busy={busy} submitError={submitError} />}
    </>
  );
}
