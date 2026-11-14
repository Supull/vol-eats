import type { Location, School } from "@/lib/types";

export const SCHOOL: School = { id: "school-utk", name: "University of Tennessee, Knoxville", slug: "utk", timezone: "America/New_York" };

export const LOCATIONS: Location[] = [
  { id: "loc-rockytop", school_id: SCHOOL.id, name: "Rocky Top Dining Hall", slug: "rockytop", kind: "dining_hall", building: "Rocky Top", accepts_swipes: true, accepts_dining_dollars: true },
  { id: "loc-stokely", school_id: SCHOOL.id, name: "Stokely Dining Hall", slug: "stokely", kind: "dining_hall", building: "Stokely", accepts_swipes: true, accepts_dining_dollars: true },
  { id: "loc-chickfila", school_id: SCHOOL.id, name: "Chick-fil-A", slug: "chick-fil-a", kind: "retail", building: "Student Union", accepts_swipes: false, accepts_dining_dollars: true },
  { id: "loc-panda", school_id: SCHOOL.id, name: "Panda Express", slug: "panda-express", kind: "retail", building: "Student Union", accepts_swipes: false, accepts_dining_dollars: true },
];
