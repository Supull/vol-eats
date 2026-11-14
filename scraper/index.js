// voleats-scraper — library entry point.
//
// Scrapes today's menu from the UTK Dining vendor pages. The menu is embedded
// in each page's HTML as escaped JSON inside a data-data="..." attribute (on
// the element with id "sm-dynamic-menu"); we extract it and normalize it.
//
// Zero dependencies. Requires Node 18+ (global fetch). Server-side only:
// browsers can't fetch dining.utk.edu directly because of CORS.

export const HALLS = {
  rockytop: {
    id: "rockytop",
    name: "Rocky Top Dining Hall",
    serviceAreaId: 125621,
    url: "https://dining.utk.edu/vendor/rocky-top-dining-hall/",
  },
  stokely: {
    id: "stokely",
    name: "Stokely Dining Hall",
    serviceAreaId: 116094,
    url: "https://dining.utk.edu/vendor/stokely-dining-hall/",
  },
};

export const HALL_IDS = Object.keys(HALLS);

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "en-US,en;q=0.9",
};

export class ScraperError extends Error {
  constructor(message, { hallId, status } = {}) {
    super(message);
    this.name = "ScraperError";
    this.hallId = hallId;
    this.status = status;
  }
}

function decodeEntities(s) {
  return s
    .replace(/&quot;|&#0*34;|&#x0*22;/gi, '"')
    .replace(/&#0*39;|&#x0*27;|&apos;/gi, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&"); // must be last
}

// Scan every data-data attribute and return the one holding the menu.
function extractMenuJson(html) {
  const re = /data-data\s*=\s*(["'])([\s\S]*?)\1/gi;
  for (const m of html.matchAll(re)) {
    const decoded = decodeEntities(m[2].trim());
    if (decoded.includes('"subLocations"')) return decoded;
  }
  return null;
}

// "1.3g" -> 1.3, "73mg" -> 73, null/"" -> null
function num(value) {
  const n = parseFloat(String(value ?? ""));
  return Number.isFinite(n) ? n : null;
}

// "Y" -> true, "N" -> false, "U"/missing -> null (unknown)
function yn(value) {
  if (value === "Y") return true;
  if (value === "N") return false;
  return null;
}

function toItem(item, period, station) {
  const n = item.nutrition ?? {};
  const nutrition = {};
  for (const [key, attr] of Object.entries(n.primary_attributes ?? {})) {
    nutrition[key] = num(attr?.value);
  }
  const contains = {};
  for (const [key, attr] of Object.entries(n.allergen_attributes ?? {})) {
    contains[key.replace(/^contains_/, "")] = yn(attr?.value);
  }
  const dietary = n.dietary_attributes ?? {};

  return {
    id: String(item.id),
    name: item.name,
    station: String(station ?? "").trim(),
    period,
    description: n.description ?? null,
    serving: n.serving_size ?? null,
    nutrition,
    vegan: yn(dietary.vegan?.value),
    vegetarian: yn(dietary.vegetarian?.value),
    contains,
    ingredients: n.ingredient_statement ?? null,
  };
}

/**
 * Pure parser: turn a vendor page's HTML into a normalized menu.
 * Useful for tests or if you fetch the HTML yourself.
 */
export function parseMenuHtml(html, hall) {
  const json = extractMenuJson(html);
  if (!json) {
    throw new ScraperError("Menu data not found on page (UTK may have changed the site)", {
      hallId: hall?.id,
    });
  }
  const raw = JSON.parse(json);

  const items = [];
  for (const sub of Object.values(raw.subLocations ?? {})) {
    for (const period of Object.values(sub.mealPeriods ?? {})) {
      for (const item of period.menuItems ?? []) items.push(toItem(item, period.name, sub.name));
    }
  }

  return {
    hallId: hall?.id ?? null,
    hall: hall?.name ?? null,
    serviceAreaId: hall?.serviceAreaId ?? raw.serviceAreaId ?? null,
    source: hall?.url ?? null,
    date: raw.serverDate ?? null,
    scrapedAt: new Date().toISOString(),
    itemCount: items.length,
    items,
  };
}

/** Scrape one hall by id ("rockytop" | "stokely"). */
export async function scrapeHall(hallId, { fetch: fetchImpl = globalThis.fetch } = {}) {
  const hall = HALLS[hallId];
  if (!hall) {
    throw new ScraperError(`Unknown hall "${hallId}". Use one of: ${HALL_IDS.join(", ")}`, {
      hallId,
      status: 404,
    });
  }
  const res = await fetchImpl(hall.url, { headers: HEADERS });
  if (!res.ok) {
    throw new ScraperError(`UTK page returned HTTP ${res.status}`, { hallId, status: 502 });
  }
  return parseMenuHtml(await res.text(), hall);
}

/** Scrape every hall. Failures are reported per hall instead of throwing. */
export async function scrapeAll(options) {
  const results = await Promise.allSettled(HALL_IDS.map((id) => scrapeHall(id, options)));
  const out = {};
  results.forEach((r, i) => {
    out[HALL_IDS[i]] =
      r.status === "fulfilled" ? r.value : { hallId: HALL_IDS[i], error: r.reason?.message ?? String(r.reason) };
  });
  return out;
}

/** Group a menu's items as { [period]: { [station]: Item[] } } — handy for UIs. */
export function groupByPeriodAndStation(menu) {
  const grouped = {};
  for (const item of menu.items) {
    (grouped[item.period] ??= {});
    (grouped[item.period][item.station] ??= []).push(item);
  }
  return grouped;
}
