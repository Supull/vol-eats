// Optional tiny HTTP API (no dependencies) so a frontend can fetch menus.
//
//   GET /menu            -> { rockytop: HallMenu, stokely: HallMenu }
//   GET /menu/rockytop   -> HallMenu
//   GET /menu/stokely    -> HallMenu
//   add ?refresh=1 to bypass the cache
//
// Usage:  PORT=3001 node server.js

import { createServer } from "node:http";
import { HALL_IDS, scrapeHall } from "./index.js";

const PORT = Number(process.env.PORT) || 3001;
const CACHE_MS = Number(process.env.CACHE_MS) || 10 * 60 * 1000; // 10 minutes
const cache = new Map(); // hallId -> { at, data }

async function getMenu(id, refresh) {
  const hit = cache.get(id);
  if (!refresh && hit && Date.now() - hit.at < CACHE_MS) return hit.data;
  const data = await scrapeHall(id);
  cache.set(id, { at: Date.now(), data });
  return data;
}

function send(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  });
  res.end(JSON.stringify(body));
}

createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, {});
  const url = new URL(req.url ?? "/", "http://localhost");
  const refresh = url.searchParams.has("refresh");
  const [, route, hallId] = url.pathname.split("/");

  if (route !== "menu") return send(res, 404, { error: "Try /menu or /menu/:hall", halls: HALL_IDS });

  try {
    if (!hallId) {
      const entries = await Promise.all(
        HALL_IDS.map(async (id) => [id, await getMenu(id, refresh).catch((e) => ({ hallId: id, error: e.message }))]),
      );
      return send(res, 200, Object.fromEntries(entries));
    }
    return send(res, 200, await getMenu(hallId, refresh));
  } catch (err) {
    return send(res, err.status ?? 500, { error: err.message });
  }
}).listen(PORT, () => {
  console.log(`voleats-scraper API on http://localhost:${PORT}/menu`);
});
