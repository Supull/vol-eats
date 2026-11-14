import { describe, expect, it } from "vitest";
import { daysLeft, formatShortDate, perWeek, proteinPerDollar, runOutDate, weeksLeft } from "./budget";
import { RETAIL_ITEMS } from "@/mock/retail-items";

describe("budget math", () => {
  it("counts days and weeks left in the semester", () => {
    expect(daysLeft("2026-11-14", "2026-12-12")).toBe(29);
    expect(weeksLeft("2026-11-14", "2026-12-12")).toBeCloseTo(29 / 7);
    expect(daysLeft("2026-12-13", "2026-12-12")).toBe(0);
    expect(weeksLeft("2026-12-13", "2026-12-12")).toBe(0);
    expect(weeksLeft("2026-12-10", "2026-12-12")).toBe(1); // floor of 1 week
  });

  it("splits a balance per week", () => {
    expect(perWeek(300, 4)).toBe(75);
    expect(perWeek(300, 0)).toBe(300);
  });

  it("projects when dining dollars run out", () => {
    expect(runOutDate(100, 50, "2026-11-14")).toBe("2026-11-28");
    expect(runOutDate(100, 0, "2026-11-14")).toBeNull();
  });

  it("ranks retail items by protein per dollar", () => {
    const top = proteinPerDollar(RETAIL_ITEMS, 3);
    // 29 g for $5.69 ≈ 5.1 g/$ beats grilled nuggets at 25 g for $6.19 ≈ 4.0 g/$.
    expect(top[0].item.name).toBe("Chick-fil-A Chicken Sandwich");
    expect(top[0].gramsPerDollar).toBeCloseTo(29 / 5.69);
    expect(top.every((t, i) => i === 0 || top[i - 1].gramsPerDollar >= t.gramsPerDollar)).toBe(true);
  });

  it("formats dates without timezone drift", () => {
    expect(formatShortDate("2026-12-12")).toBe("Dec 12");
  });
});
