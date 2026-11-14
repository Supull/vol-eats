import { describe, expect, it } from "vitest";
import { withAiFallback } from "./api";

describe("withAiFallback", () => {
  it("returns the AI result when it is fast", async () => {
    expect(await withAiFallback(Promise.resolve("ai"), () => "fallback", 50)).toEqual({ data: "ai", offline: false });
  });

  it("falls back when the AI call fails", async () => {
    expect(await withAiFallback(Promise.reject(new Error("500")), () => "fallback", 50)).toEqual({ data: "fallback", offline: true });
  });

  it("falls back when the AI call is too slow", async () => {
    const slow = new Promise<string>((r) => setTimeout(() => r("late"), 200));
    expect(await withAiFallback(slow, () => "fallback", 20)).toEqual({ data: "fallback", offline: true });
  });
});
