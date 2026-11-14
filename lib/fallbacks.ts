// Offline fallbacks shown when an AI call times out or fails (with an "offline estimate" label).
import type { Macros, TargetsExplanation } from "./types";

export function genericTargetsExplanation(targets: Macros): TargetsExplanation {
  return {
    explanation: `Based on your body and activity level, about ${targets.calories} calories a day fits your goal. Protein is set high to protect muscle, and the rest is split between carbs and fat so you have energy for class and workouts.`,
  };
}
