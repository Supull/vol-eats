import type { MealPlanType } from "./types";

export interface MealPlanOption {
  name: string;
  group: "Freshman" | "Upperclass" | "Dining dollars only" | "None";
  type: MealPlanType;
  /** Unlimited plans have no swipe count to track. */
  unlimited: boolean;
  /** Block plans have a fixed number of swipes per semester. */
  block: boolean;
}

// TODO(verify): which plans include dining dollars. Unlimited/Weekly/Block
// plans are assumed to come with dining dollars ("both").
export const MEAL_PLANS: MealPlanOption[] = [
  { name: "Tennessee Unlimited 7", group: "Freshman", type: "both", unlimited: true, block: false },
  { name: "Tennessee Unlimited 5", group: "Freshman", type: "both", unlimited: true, block: false },
  { name: "Tennessee Weekly 7", group: "Upperclass", type: "both", unlimited: false, block: false },
  { name: "Vol Block 100", group: "Upperclass", type: "both", unlimited: false, block: true },
  { name: "Vol Block 75", group: "Upperclass", type: "both", unlimited: false, block: true },
  { name: "Vol Block 50", group: "Upperclass", type: "both", unlimited: false, block: true },
  { name: "Dining Dollar Plus", group: "Dining dollars only", type: "dining_dollars", unlimited: false, block: false },
  { name: "Dining Dollar Plan", group: "Dining dollars only", type: "dining_dollars", unlimited: false, block: false },
  { name: "No meal plan", group: "None", type: "none", unlimited: false, block: false },
];

export function findMealPlan(name: string | null | undefined) {
  return MEAL_PLANS.find((p) => p.name === name) ?? null;
}
