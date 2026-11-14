import type { Event } from "@/lib/types";
import { SCHOOL } from "./locations";

/** Builds an ISO timestamp for today at hh:mm Eastern. */
function todayAt(date: string, hhmm: string) {
  // Eastern offset: EST (-05:00) Nov–Mar, EDT (-04:00) otherwise. Close enough for mocks.
  const month = Number(date.slice(5, 7));
  const offset = month >= 11 || month <= 3 ? "-05:00" : "-04:00";
  return new Date(`${date}T${hhmm}:00${offset}`).toISOString();
}

export function mockEvents(date: string): Event[] {
  return [
    { id: "evt-1", school_id: SCHOOL.id, title: "CS Club study night", location_name: "Min Kao 405", starts_at: todayAt(date, "12:00"), ends_at: todayAt(date, "13:30"), food_description: "Cheese and pepperoni pizza", est_calories: 600, source_url: null },
    { id: "evt-2", school_id: SCHOOL.id, title: "Career fair prep session", location_name: "Haslam Business 102", starts_at: todayAt(date, "15:00"), ends_at: todayAt(date, "16:00"), food_description: "Chick-fil-A nugget trays", est_calories: 380, source_url: null },
    { id: "evt-3", school_id: SCHOOL.id, title: "Engineers Without Borders meeting", location_name: "Zeanah Engineering 200", starts_at: todayAt(date, "18:00"), ends_at: todayAt(date, "19:00"), food_description: "Burrito bowls (chicken + veggie)", est_calories: 750, source_url: null },
    { id: "evt-4", school_id: SCHOOL.id, title: "Late-night library break", location_name: "Hodges Library lobby", starts_at: todayAt(date, "21:00"), ends_at: null, food_description: "Cookies and coffee", est_calories: null, source_url: null },
  ];
}
