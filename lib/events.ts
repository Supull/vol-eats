import type { Event } from "./types";

export type FitStatus = "fits" | "over" | "unknown";

/** Whether an event's estimated calories fit in what's left today. */
export function fitStatus(event: Pick<Event, "est_calories">, remainingCalories: number): FitStatus {
  if (event.est_calories == null) return "unknown";
  return event.est_calories <= remainingCalories ? "fits" : "over";
}

const HOUR = 60 * 60 * 1000;

/** Events that haven't ended yet (no end time = assume 1 hour), soonest first. */
export function upcomingEvents(events: Event[], now: Date = new Date()) {
  return events
    .filter((e) => new Date(e.ends_at ?? new Date(e.starts_at).getTime() + HOUR).getTime() > now.getTime())
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
}

export function isHappeningNow(e: Event, now: Date = new Date()) {
  const start = new Date(e.starts_at).getTime();
  const end = e.ends_at ? new Date(e.ends_at).getTime() : start + HOUR;
  return start <= now.getTime() && now.getTime() < end;
}
