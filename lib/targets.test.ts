import { describe, expect, it } from "vitest";
import { bmr, computeTargets, KCAL_PER_G, MIN_CALORIES, tdee } from "./targets";

const base = { sex: "male", age: 20, height_cm: 178, weight_kg: 77, activity_level: "moderate" } as const;

describe("bmr (Mifflin-St Jeor)", () => {
  it("matches the published formula for men", () => {
    // 10*77 + 6.25*178 - 5*20 + 5 = 1787.5
    expect(bmr(base)).toBeCloseTo(1787.5);
  });

  it("uses -161 for women", () => {
    expect(bmr({ ...base, sex: "female" })).toBeCloseTo(1787.5 - 5 - 161);
  });

  it("uses the average constant (-78) when sex is unspecified", () => {
    expect(bmr({ ...base, sex: "unspecified" })).toBeCloseTo(1787.5 - 5 - 78);
  });
});

describe("tdee", () => {
  it("applies the activity multiplier", () => {
    expect(tdee(base)).toBeCloseTo(1787.5 * 1.55);
    expect(tdee({ ...base, activity_level: "sedentary" })).toBeCloseTo(1787.5 * 1.2);
  });
});

describe("computeTargets", () => {
  it("adds a surplus for building muscle and a deficit for losing fat", () => {
    const maintain = computeTargets({ ...base, goal_type: "maintain" });
    const bulk = computeTargets({ ...base, goal_type: "build_muscle" });
    const cut = computeTargets({ ...base, goal_type: "lose_fat" });
    expect(maintain.calories).toBe(2770); // 2770.6 rounded to 10
    expect(bulk.calories).toBe(3070);
    expect(cut.calories).toBe(2270);
  });

  it("keeps macro calories close to the calorie target", () => {
    for (const goal_type of ["lose_fat", "build_muscle", "maintain"] as const) {
      const t = computeTargets({ ...base, goal_type });
      const fromMacros = t.protein_g * KCAL_PER_G.protein + t.carbs_g * KCAL_PER_G.carbs + t.fat_g * KCAL_PER_G.fat;
      expect(Math.abs(fromMacros - t.calories)).toBeLessThanOrEqual(10);
    }
  });

  it("sets protein from body weight", () => {
    expect(computeTargets({ ...base, goal_type: "build_muscle" }).protein_g).toBe(Math.round(77 * 1.8));
  });

  it("never goes below the calorie floor", () => {
    const t = computeTargets({
      sex: "female",
      age: 60,
      height_cm: 150,
      weight_kg: 45,
      activity_level: "sedentary",
      goal_type: "lose_fat",
    });
    expect(t.calories).toBe(MIN_CALORIES);
    expect(t.carbs_g).toBeGreaterThanOrEqual(0);
  });
});
