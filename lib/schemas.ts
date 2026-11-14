// Shared zod schemas (forms + API payloads). Onboarding steps validate separately
// so each step can block "Next" on its own fields.
import { z } from "zod";
import { MEAL_PLANS } from "./meal-plans";
import { minHealthyWeightKg } from "./units";

export const goalTypeSchema = z.enum(["lose_fat", "build_muscle", "maintain"]);
export const sexSchema = z.enum(["male", "female", "unspecified"]);
export const activitySchema = z.enum(["sedentary", "light", "moderate", "very_active"]);
export const dietTagSchema = z.enum(["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "no_pork"]);
export const allergenSchema = z.enum([
  "milk",
  "eggs",
  "fish",
  "shellfish",
  "tree_nuts",
  "peanut",
  "wheat",
  "gluten",
  "soy",
  "sesame",
]);
export const mealPeriodSchema = z.enum(["breakfast", "lunch", "dinner"]);

/* ---------- Onboarding ---------- */

export const goalStepSchema = z.object({
  goal_type: goalTypeSchema,
  goal_text: z.string().trim().max(280).optional().or(z.literal("")),
});

/** Body step, already converted to metric by the form. */
export const bodyStepSchema = z
  .object({
    goal_type: goalTypeSchema,
    sex: sexSchema,
    age: z.number().int().min(16, "Must be 16 or older").max(80, "Must be 80 or younger"),
    height_cm: z.number().min(120, "Check your height").max(230, "Check your height"),
    weight_kg: z.number().min(35, "Check your weight").max(250, "Check your weight"),
    goal_weight_kg: z.number().min(35, "Check your goal weight").max(250, "Check your goal weight"),
    activity_level: activitySchema,
  })
  .superRefine((v, ctx) => {
    if (v.goal_weight_kg < minHealthyWeightKg(v.height_cm)) {
      ctx.addIssue({
        code: "custom",
        path: ["goal_weight_kg"],
        message: "That goal is below a healthy weight for your height. Try a slightly higher goal.",
      });
    }
    if (v.goal_type === "lose_fat" && v.goal_weight_kg >= v.weight_kg) {
      ctx.addIssue({ code: "custom", path: ["goal_weight_kg"], message: "To lose fat, set a goal below your current weight." });
    }
    if (v.goal_type === "build_muscle" && v.goal_weight_kg <= v.weight_kg) {
      ctx.addIssue({ code: "custom", path: ["goal_weight_kg"], message: "To build muscle, set a goal above your current weight." });
    }
  });

export const dietStepSchema = z.object({
  diet_tags: z.array(dietTagSchema),
  allergens: z.array(allergenSchema),
});

const money = z.number().min(0, "Can't be negative").max(10000);

export const planStepSchema = z
  .object({
    meal_plan_name: z.enum(MEAL_PLANS.map((p) => p.name) as [string, ...string[]]),
    dining_dollars_balance: money.nullable(),
    swipes_remaining: z.number().int().min(0).max(500).nullable(),
    weekly_food_budget_usd: money.nullable(),
  });

/* ---------- Logs ---------- */

export const foodLogInputSchema = z.object({
  menu_item_id: z.string().nullable(),
  name: z.string().trim().min(1, "Give it a name").max(120),
  servings: z.number().min(0.5).max(10).multipleOf(0.5),
  calories: z.number().min(0).max(5000),
  protein_g: z.number().min(0).max(500),
  carbs_g: z.number().min(0).max(1000),
  fat_g: z.number().min(0).max(500),
  meal_period: mealPeriodSchema,
  source: z.enum(["menu", "plate", "photo", "manual"]),
  logged_at: z.string().optional(),
});
