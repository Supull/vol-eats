// Pure budget math for the Budget screen. Dates are YYYY-MM-DD strings in school time.
import type { MenuItem } from "./types";

const DAY = 24 * 60 * 60 * 1000;
const toUtc = (ymd: string) => Date.UTC(Number(ymd.slice(0, 4)), Number(ymd.slice(5, 7)) - 1, Number(ymd.slice(8, 10)));

/** Days from `today` through `end` (inclusive of today), never negative. */
export function daysLeft(today: string, end: string) {
  return Math.max(0, Math.round((toUtc(end) - toUtc(today)) / DAY) + 1);
}

/** Weeks left, at least 1 while any days remain so per-week math never divides by a tiny number. */
export function weeksLeft(today: string, end: string) {
  const days = daysLeft(today, end);
  return days === 0 ? 0 : Math.max(1, days / 7);
}

/** How much can be used per week to last until the end. */
export function perWeek(amount: number, weeks: number) {
  return weeks > 0 ? amount / weeks : amount;
}

/** Date the balance runs out at `spentPerWeek`, or null if not spending. */
export function runOutDate(balance: number, spentPerWeek: number, today: string): string | null {
  if (spentPerWeek <= 0) return null;
  const days = Math.floor((balance / spentPerWeek) * 7);
  return new Date(toUtc(today) + days * DAY).toISOString().slice(0, 10);
}

/** Retail items ranked by grams of protein per dollar. */
export function proteinPerDollar(items: MenuItem[], limit = 5) {
  return items
    .filter((i) => (i.price_usd ?? 0) > 0 && i.protein_g > 0)
    .map((i) => ({ item: i, gramsPerDollar: i.protein_g / i.price_usd! }))
    .sort((a, b) => b.gramsPerDollar - a.gramsPerDollar)
    .slice(0, limit);
}

export function formatUsd(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

/** "Dec 12" from YYYY-MM-DD, without timezone drift. */
export function formatShortDate(ymd: string) {
  return new Date(toUtc(ymd)).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}
