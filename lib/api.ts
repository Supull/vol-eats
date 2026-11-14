/*
 * Typed client for the backend routes. Screens import `api` and nothing else.
 *
 * TODO(§9): CONTEXT.md §9 wasn't in the repo when this was written; the paths
 * and payloads below are the proposed contract. If a teammate's route differs,
 * change it here (and the matching case in lib/mock-api.ts).
 *
 * With NEXT_PUBLIC_USE_MOCKS=true every call goes to lib/mock-api.ts instead
 * of fetch, using the same method + path, so swapping is a one-flag change.
 */
import { AI_TIMEOUT_MS, USE_MOCKS } from "./config";
import type {
  Event,
  FoodLog,
  FoodLogInput,
  Location,
  Macros,
  MealPeriod,
  MenuItem,
  PhotoEstimate,
  PlateRecommendation,
  Profile,
  ProfileInput,
  TargetsExplanation,
} from "./types";

import { ApiError } from "./errors";

export { ApiError, errorMessage } from "./errors";

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  if (USE_MOCKS) {
    const { mockRequest } = await import("./mock-api");
    return mockRequest<T>(method, path, body);
  }
  let res: Response;
  try {
    res = await fetch(path, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Network error");
  }
  if (!res.ok) throw new ApiError(res.status, (await res.text().catch(() => "")) || res.statusText);
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

function qs(params: Record<string, string | undefined>) {
  const s = new URLSearchParams(Object.entries(params).filter((e): e is [string, string] => e[1] !== undefined));
  const str = s.toString();
  return str ? `?${str}` : "";
}

/* ---------- AI fallback ---------- */

export interface AiResult<T> {
  data: T;
  /** True when the AI call timed out or failed and `data` is the fallback. */
  offline: boolean;
}

/** Runs an AI call with a 5 s budget; on timeout or error returns the fallback. */
export async function withAiFallback<T>(call: Promise<T>, fallback: () => T, timeoutMs = AI_TIMEOUT_MS): Promise<AiResult<T>> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("AI timeout")), timeoutMs);
  });
  try {
    return { data: await Promise.race([call, timeout]), offline: false };
  } catch {
    return { data: fallback(), offline: true };
  } finally {
    clearTimeout(timer);
  }
}

/* ---------- Routes ---------- */

export const api = {
  locations: () => request<Location[]>("GET", "/api/locations"),

  menus: (params: { location_id: string; date?: string; meal_period?: MealPeriod }) =>
    request<MenuItem[]>("GET", `/api/menus${qs(params)}`),

  getProfile: () => request<Profile | null>("GET", "/api/profile"),
  /** Creates or replaces the profile; the server computes targets (CONTEXT §7). */
  saveProfile: (input: ProfileInput) => request<Profile>("POST", "/api/profile", input),
  /** Manual target overrides from the "Adjust" sliders. */
  updateTargets: (targets: Pick<Profile, "target_calories" | "target_protein_g" | "target_carbs_g" | "target_fat_g">) =>
    request<Profile>("PATCH", "/api/profile", targets),

  logs: (params: { date?: string } = {}) => request<FoodLog[]>("GET", `/api/logs${qs(params)}`),
  addLog: (input: FoodLogInput) => request<FoodLog>("POST", "/api/logs", input),
  updateLog: (id: string, patch: Partial<FoodLogInput>) => request<FoodLog>("PATCH", `/api/logs/${encodeURIComponent(id)}`, patch),
  deleteLog: (id: string) => request<void>("DELETE", `/api/logs/${encodeURIComponent(id)}`),

  events: (params: { date?: string } = {}) => request<Event[]>("GET", `/api/events${qs(params)}`),

  ai: {
    targets: (profile: Profile) => request<TargetsExplanation>("POST", "/api/ai/targets", { profile_id: profile.id }),
    plates: (body: { location_id: string; meal_period: MealPeriod; remaining: Macros }) =>
      request<PlateRecommendation>("POST", "/api/ai/plates", body),
    /** `image` is a data URL (base64). */
    photo: (image: string) => request<PhotoEstimate>("POST", "/api/ai/photo", { image }),
  },
};
