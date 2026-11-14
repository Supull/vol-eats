import { describe, expect, it } from "vitest";
import type { MenuItem } from "@/lib/types";
import { remaining, sumLogs } from "@/lib/macros";
import { buildPlates } from "@/lib/plate-builder";
import { fitsDiet } from "@/lib/diet";
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

const REMAINING = { calories: 900, protein_g: 60, carbs_g: 90, fat_g: 30 };
const lunch = halls.filter((i) => i.location_id === "loc-rockytop" && i.meal_period === "lunch");

describe("buildPlates", () => {
  it("returns 2–3 plates from the given menu with correct totals", () => {
    const { plates } = buildPlates(lunch, REMAINING);
    expect(plates.length).toBeGreaterThanOrEqual(2);
    for (const p of plates) {
      expect(p.items.every((it) => lunch.some((m) => m.id === it.menu_item_id))).toBe(true);
      expect(p.totals).toEqual(sumLogs(p.items));
    }
  });

  it("varies picks on regenerate", () => {
    const a = buildPlates(lunch, REMAINING, 0).plates[0].items.map((i) => i.menu_item_id);
    const b = buildPlates(lunch, REMAINING, 1).plates[0].items.map((i) => i.menu_item_id);
    expect(a).not.toEqual(b);
  });

  it("works for tiny menus (retail) and returns nothing for an empty menu", () => {
    const panda = RETAIL_ITEMS.filter((i) => i.location_id === "loc-panda");
    expect(buildPlates(panda, REMAINING).plates.length).toBeGreaterThanOrEqual(1);
    expect(buildPlates([], REMAINING).plates).toEqual([]);
  });
});

describe("fitsDiet", () => {
  const byName = (n: string) => [...halls, ...RETAIL_ITEMS].find((i) => i.name === n)!;

  it("only keeps tagged items for vegetarian/vegan", () => {
    expect(fitsDiet(byName("Grilled Chicken"), ["vegetarian"], [])).toBe(false);
    expect(fitsDiet(byName("Spicy Plant-Based Chicken Tenders"), ["vegan"], [])).toBe(true);
  });

  it("drops pork by name for no-pork and halal", () => {
    expect(fitsDiet(byName("Pork Sausage Links"), ["no_pork"], [])).toBe(false);
    expect(fitsDiet(byName("Pork Sausage Links"), ["halal"], [])).toBe(false);
    expect(fitsDiet(byName("Grilled Chicken"), ["halal"], [])).toBe(true);
  });

  it("drops items with the user's allergens", () => {
    expect(fitsDiet(byName("Chick-fil-A Chicken Sandwich"), [], ["wheat"])).toBe(false);
    expect(fitsDiet(byName("Grilled Nuggets (8 ct)"), [], ["wheat"])).toBe(true);
  });

  it("vegetarian plates contain no meat", () => {
    const veg = lunch.filter((i) => fitsDiet(i, ["vegetarian"], []));
    const { plates } = buildPlates(veg, REMAINING);
    expect(plates.flatMap((p) => p.items).every((it) => veg.some((v) => v.id === it.menu_item_id))).toBe(true);
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
