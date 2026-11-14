import { describe, expect, it } from "vitest";
import { currentMealPeriod, schoolDate } from "./meal-period";
import { bmi, cmToFtIn, ftInToCm, kgToLb, lbToKg, minHealthyWeightKg } from "./units";

// Nov 14 2026 is EST (UTC-5).
const et = (hhmm: string) => new Date(`2026-11-14T${hhmm}:00-05:00`);

describe("currentMealPeriod (school time)", () => {
  it("switches at 10:30 AM and 4:30 PM Eastern", () => {
    expect(currentMealPeriod(et("07:00"))).toBe("breakfast");
    expect(currentMealPeriod(et("10:29"))).toBe("breakfast");
    expect(currentMealPeriod(et("10:30"))).toBe("lunch");
    expect(currentMealPeriod(et("16:29"))).toBe("lunch");
    expect(currentMealPeriod(et("16:30"))).toBe("dinner");
    expect(currentMealPeriod(et("23:59"))).toBe("dinner");
  });

  it("uses school date, not UTC date", () => {
    expect(schoolDate(et("22:00"))).toBe("2026-11-14"); // already Nov 15 in UTC
  });
});

describe("units", () => {
  it("round-trips height and weight", () => {
    expect(ftInToCm(5, 10)).toBeCloseTo(177.8);
    expect(cmToFtIn(177.8)).toEqual({ feet: 5, inches: 10 });
    expect(lbToKg(170)).toBeCloseTo(77.1);
    expect(kgToLb(77.1)).toBe(170);
  });

  it("computes BMI and the healthy-weight floor", () => {
    expect(bmi(77, 178)).toBeCloseTo(24.3, 1);
    expect(bmi(minHealthyWeightKg(178), 178)).toBeCloseTo(18.5);
  });
});
