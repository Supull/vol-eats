import { SCHOOL_TIMEZONE } from "./config";

/** "12:30 PM" in school time. */
export function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone: SCHOOL_TIMEZONE, hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

/** "Saturday, November 14" in school time. */
export function formatLongDate(date: Date = new Date()) {
  return new Intl.DateTimeFormat("en-US", { timeZone: SCHOOL_TIMEZONE, weekday: "long", month: "long", day: "numeric" }).format(date);
}

/** Hour (0–23) in school time. */
export function schoolHour(date: Date = new Date()) {
  return Number(new Intl.DateTimeFormat("en-US", { timeZone: SCHOOL_TIMEZONE, hour: "numeric", hourCycle: "h23" }).format(date));
}

export function greeting(date: Date = new Date()) {
  const h = schoolHour(date);
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
