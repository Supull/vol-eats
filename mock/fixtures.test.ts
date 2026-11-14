import { describe, expect, it } from "vitest";
import type { MenuItem } from "@/lib/types";
import { remaining, sumLogs } from "@/lib/macros";
import { buildMockPlates } from "./ai";
import { LOCATIONS } from "./locations";
import { RETAIL_ITEMS } from "./retail-items";
import { DEMO_PROFILE, demoLogs } from "./demo-profile";
import { mockEvents } from "./events";
import hallItems from "./menu-items.generated.json";

const halls = hallItems as MenuItem[];
const locationIds = new Set(LOCATIONS.map((l) => l.id));

describe("mock fixtures", () => {
  it("has ~25+ items per dining hall across all three meal periods", () => {
    for (const loc of ["loc-rockytop", "loc-stokely"]) {
      const items = halls.filter((i) => i.location_id === loc);
      expect(items.length).toBeGreaterThanOrEqual(25);
      expect(new Set(items.map((i) => i.meal_period))).toEqual(new Set(["breakfast", "lunch", "dinner"]));
    }
  });

  it("uses known locations and unique ids", () => {
    const all = [...halls, ...RETAIL_ITEMS];
    expect(all.every((i) => locationIds.has(i.location_id))).toBe(true);
    expect(new Set(all.map((i) => i.id)).size).toBe(all.length);
  });

  it("has 10 all-day retail items with prices", () => {
    expect(RETAIL_ITEMS).toHaveLength(10);
    expect(RETAIL_ITEMS.every((i) => i.date === null && i.meal_period === "all_day" && (i.price_usd ?? 0) > 0)).toBe(true);
  });

  it("has 4 events and a demo user with breakfast logged", () => {
    expect(mockEvents("2026-11-14")).toHaveLength(4);
    const logs = demoLogs("2026-11-14");
    expect(logs.every((l) => l.meal_period === "breakfast")).toBe(true);
    expect(sumLogs(logs).calories).toBeLessThan(DEMO_PROFILE.target_calories);
  });
});

describe("buildMockPlates", () => {
  it("returns 2–3 plates from the given menu with correct totals", () => {
    const menu = halls.filter((i) => i.location_id === "loc-rockytop" && i.meal_period === "lunch");
    const { plates } = buildMockPlates(menu, { calories: 900, protein_g: 60, carbs_g: 90, fat_g: 30 });
    expect(plates.length).toBeGreaterThanOrEqual(2);
    for (const p of plates) {
      expect(p.items.every((it) => menu.some((m) => m.id === it.menu_item_id))).toBe(true);
      expect(p.totals).toEqual(sumLogs(p.items));
    }
  });

  it("returns no plates for an empty menu", () => {
    expect(buildMockPlates([], { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }).plates).toEqual([]);
  });
});

describe("remaining", () => {
  it("never goes negative", () => {
    expect(remaining({ calories: 100, protein_g: 10, carbs_g: 10, fat_g: 10 }, { calories: 150, protein_g: 5, carbs_g: 10, fat_g: 0 })).toEqual({
      calories: 0,
      protein_g: 5,
      carbs_g: 0,
      fat_g: 10,
    });
  });
});
