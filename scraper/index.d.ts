export type HallId = "rockytop" | "stokely";

export interface Hall {
  id: HallId;
  name: string;
  serviceAreaId: number;
  url: string;
}

/** true = yes, false = no, null = UTK lists it as unknown */
export type Flag = boolean | null;

export interface MenuItem {
  id: string;
  name: string;
  /** e.g. "Bakery", "Grill", "Tex Mex" */
  station: string;
  /** e.g. "Breakfast", "Lunch", "Dinner" */
  period: string;
  description: string | null;
  serving: string | null;
  /** calories, protein (g), total_fat (g), saturated_fat, trans_fat, cholesterol (mg),
   *  sodium (mg), carbohydrate (g), fiber, total_sugars, calcium, iron, potassium */
  nutrition: Record<string, number | null>;
  vegan: Flag;
  vegetarian: Flag;
  /** milk, eggs, fish, shellfish, peanut, tree_nuts, wheat, gluten, soy, sesame */
  contains: Record<string, Flag>;
  ingredients: string | null;
}

export interface HallMenu {
  hallId: HallId | null;
  hall: string | null;
  serviceAreaId: number | null;
  source: string | null;
  /** UTK server date, YYYY-MM-DD */
  date: string | null;
  /** ISO timestamp of when this was scraped */
  scrapedAt: string;
  itemCount: number;
  items: MenuItem[];
}

export interface HallError {
  hallId: HallId;
  error: string;
}

export declare const HALLS: Record<HallId, Hall>;
export declare const HALL_IDS: HallId[];

export declare class ScraperError extends Error {
  hallId?: string;
  status?: number;
}

export interface ScrapeOptions {
  /** Custom fetch implementation (defaults to global fetch). */
  fetch?: typeof fetch;
}

export declare function parseMenuHtml(html: string, hall?: Hall): HallMenu;
export declare function scrapeHall(hallId: HallId, options?: ScrapeOptions): Promise<HallMenu>;
export declare function scrapeAll(options?: ScrapeOptions): Promise<Record<HallId, HallMenu | HallError>>;
export declare function groupByPeriodAndStation(menu: HallMenu): Record<string, Record<string, MenuItem[]>>;
