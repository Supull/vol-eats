// Canned AI responses for the mock backend. Plate picks use lib/plate-builder.ts.
import type { PhotoEstimate, Profile, TargetsExplanation } from "@/lib/types";
import { targetsOf } from "@/lib/macros";

export const MOCK_PHOTO_ESTIMATE: PhotoEstimate = {
  name: "Grilled chicken, rice and broccoli",
  calories: 620,
  protein_g: 45,
  carbs_g: 68,
  fat_g: 16,
  confidence: "medium",
  notes: "Assumed about 6 oz chicken and 1.5 cups rice. Adjust if your portion was different.",
};

/** What the mock "AI" returns: goal-aware copy. (The real route may also return adjustments.) */
export function mockTargetsExplanation(p: Profile): TargetsExplanation {
  const t = targetsOf(p);
  const goal = {
    lose_fat: "a steady deficit of about 500 calories so you lose roughly a pound a week",
    build_muscle: "a small surplus of about 300 calories so the gain is mostly muscle",
    maintain: "your maintenance calories so your weight stays steady",
  }[p.goal_type];
  return {
    explanation: `We set ${t.calories} calories, ${goal}. ${t.protein_g} g of protein supports your training, and carbs fuel your workouts.`,
  };
}
