// Onboarding answers autosaved to localStorage so a refresh doesn't lose them.
import type { ActivityLevel, Allergen, DietTag, GoalType, Sex } from "./types";

const KEY = "cf.onboarding-draft";

export type UnitSystem = "imperial" | "metric";

export interface OnboardingDraft {
  step: number; // 0-based
  goal_type?: GoalType;
  goal_text?: string;

  sex?: Sex;
  age?: number;
  units: UnitSystem;
  height_ft?: number;
  height_in?: number;
  height_cm?: number;
  /** In the chosen units (lb or kg). */
  weight?: number;
  goal_weight?: number;
  activity_level?: ActivityLevel;
  /** Metric values, filled in when the body step passes validation. */
  weight_kg?: number;
  goal_weight_kg?: number;

  diet_tags: DietTag[];
  no_restrictions: boolean;
  allergens: Allergen[];

  meal_plan_name?: string;
  dining_dollars_balance?: number | null;
  swipes_remaining?: number | null;
  weekly_food_budget_usd?: number | null;
}

export const EMPTY_DRAFT: OnboardingDraft = { step: 0, units: "imperial", diet_tags: [], no_restrictions: false, allergens: [] };

export function loadDraft(): OnboardingDraft {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return { ...EMPTY_DRAFT, ...(JSON.parse(raw) as Partial<OnboardingDraft>) };
  } catch {}
  return EMPTY_DRAFT;
}

export function saveDraft(draft: OnboardingDraft) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(draft));
  } catch {}
}

export function clearDraft() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {}
}
