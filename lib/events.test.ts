import { describe, expect, it } from "vitest";
import { fitStatus, isHappeningNow, upcomingEvents } from "./events";
import { formatTime, greeting } from "./format";
import { mockEvents } from "@/mock/events";

const events = mockEvents("2026-11-14"); // 12:00, 15:00, 18:00, 21:00 (no end) Eastern
const et = (hhmm: string) => new Date(`2026-11-14T${hhmm}:00-05:00`);

describe("events helpers", () => {
  it("rates fit against remaining calories", () => {
    expect(fitStatus({ est_calories: 500 }, 600)).toBe("fits");
    expect(fitStatus({ est_calories: 700 }, 600)).toBe("over");
    expect(fitStatus({ est_calories: null }, 600)).toBe("unknown");
  });

  it("keeps events that haven't ended, soonest first", () => {
    expect(upcomingEvents(events, et("12:30")).map((e) => e.id)).toEqual(["evt-1", "evt-2", "evt-3", "evt-4"]);
    expect(upcomingEvents(events, et("13:31")).map((e) => e.id)).toEqual(["evt-2", "evt-3", "evt-4"]);
    // evt-4 has no end time: treated as 1 hour long.
    expect(upcomingEvents(events, et("22:01"))).toEqual([]);
  });

  it("detects events happening now", () => {
    expect(isHappeningNow(events[0], et("12:15"))).toBe(true);
    expect(isHappeningNow(events[0], et("13:45"))).toBe(false);
  });
});

describe("format", () => {
  it("formats times and greetings in Eastern time", () => {
    expect(formatTime(et("18:00").toISOString())).toBe("6:00 PM");
    expect(greeting(et("08:00"))).toBe("Good morning");
    expect(greeting(et("13:00"))).toBe("Good afternoon");
    expect(greeting(et("19:00"))).toBe("Good evening");
  });
});
