import { MEAL_PERIOD_CUTOFFS, SCHOOL_TIMEZONE } from "./config";
import type { MealPeriod } from "./types";

/** Hours and minutes of `date` on the school's wall clock. */
function schoolClock(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SCHOOL_TIMEZONE,
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { hour: get("hour"), minute: get("minute") };
}

/** Breakfast until 10:30 AM, lunch until 4:30 PM, dinner after (CONTEXT §4). */
export function currentMealPeriod(now: Date = new Date()): MealPeriod {
  const { hour, minute } = schoolClock(now);
  const minutes = hour * 60 + minute;
  if (minutes < MEAL_PERIOD_CUTOFFS.breakfastEnds) return "breakfast";
  if (minutes < MEAL_PERIOD_CUTOFFS.lunchEnds) return "lunch";
  return "dinner";
}

/** YYYY-MM-DD for `date` in school time. */
export function schoolDate(date: Date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: SCHOOL_TIMEZONE }).format(date);
}

export const MEAL_PERIOD_LABELS: Record<MealPeriod, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};
