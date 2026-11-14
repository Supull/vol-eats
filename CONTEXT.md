All the changes done by the AI is entered in here.

## 2026-11-14 — Frontend phase 1: shell (Claude Code, for Swagat)

**Added** a Next.js 16 app (App Router, TypeScript strict, Tailwind v4) at the repo root, next to `scraper/`.

- `app/globals.css`: design tokens (placeholder theme, UT orange). Tailwind v4 maps tokens in CSS, so there is no `tailwind.config.ts`. Token list: `docs/theme.md`.
- `app/(app)/layout.tsx` + `components/layout/bottom-tabs.tsx`: mobile shell, 480px max width, tabs Today · Menus · Log · Budget · Events. Tab pages are placeholders for now.
- `lib/types.ts`: School, Location, MenuItem, Profile, FoodLog, Event, plus the proposed AI response types.
- `lib/api.ts`: typed client, one function per route. `NEXT_PUBLIC_USE_MOCKS=true` (in `.env.local`) routes calls to `lib/mock-api.ts`, which has fake latency and `?fail=1` to simulate errors.
- `lib/targets.ts`: Mifflin-St Jeor targets. Also `lib/meal-period.ts` (Eastern-time breakfast/lunch/dinner), `lib/units.ts`, `lib/schemas.ts` (zod), `lib/meal-plans.ts`.
- `mock/`: dining hall menus generated from the real scraper output (`npm run mock:menus`), 10 retail items, 4 events, demo profile with breakfast logged, canned AI responses.
- Tests: `npm test` (vitest, 24 tests).

**Needs teammate confirmation** (CONTEXT §7–§9 weren't written yet, so these are guesses):
- Supul: table/field names in `lib/types.ts`, and the `TODO(schema)` fields on Profile (`goal_type`, `meal_plan_name`, `dining_dollars_balance`, `swipes_remaining`, `weekly_food_budget_usd`) and `MenuItem.price_usd`.
- Route paths and payloads in `lib/api.ts` (`TODO(§9)`).
- Aarohan: `PROPOSED` AI response types (TargetsExplanation, PlateRecommendation, PhotoEstimate).
- Formula constants in `lib/targets.ts` (`TODO(§7)`): activity multipliers, −500/+300 kcal goal deltas, protein g/kg, 25% fat.

## 2026-11-14 — Frontend phase 2: login, onboarding, targets reveal (Claude Code, for Swagat)

- `/login` (`app/(auth)/login`): mocked sign-in. Accepts `@vols.utk.edu` / `@utk.edu`, and "Use demo account" signs in as the seeded demo user. New users go to `/onboarding`, existing users to `/today`. `TODO(auth)`: real sign-in replaces `lib/session.ts`.
- `/onboarding` (`app/(onboarding)/onboarding` + `components/onboarding/*`): 4 steps (goal, body, diet, meal plan & money), each validated with zod before Next. Answers autosave to localStorage, so a refresh keeps your place. Body step guardrails: goal BMI ≥ 18.5, and goal weight must be below current weight for "Lose fat" or above it for "Build muscle". ft/lb ↔ cm/kg toggle; values are saved in metric. Submit calls `POST /api/profile`.
- `/onboarding/targets`: calorie count-up, protein/carbs/fat cards, AI explanation (`POST /api/ai/targets`). If the AI takes over 5 s or fails, it shows the formula numbers with a generic explanation labeled "Offline estimate". "Adjust" opens sliders and saves with `PATCH /api/profile`.
- `lib/hooks/use-profile.tsx`: `ProfileProvider` wraps the main app. It loads the profile once and redirects to `/login` (no session) or `/onboarding` (no profile).
- Small UI primitives in `components/ui/` (Button, Field/Input/Select, ChoiceCards, ChipGroup, Skeleton, ErrorState). They're token-styled and deliberately plain until the theme is chosen.
- New route used: `PATCH /api/profile` for manual target overrides (`TODO(§9)`: confirm with backend).
- Tests: 27 passing (`npm test`).

## 2026-11-14 — Frontend phase 3: Today dashboard and logging (Claude Code, for Swagat)

- `/today` (`app/(app)/today/page.tsx`): greeting, date and current meal period (Eastern time), a big calorie ring and three small protein/carbs/fat rings (`components/today/macro-ring.tsx`, plain SVG, every number also shown as text), a "What should I eat?" button that goes to `/plates`, the free-food card, the logged meals list, an empty state for new users, and a sign-out button.
- Logged meals are grouped by meal period. Tapping one opens a bottom sheet (`components/ui/sheet.tsx`, native `<dialog>`) with a 0.5-step servings stepper, Save and Delete. Delete shows an "Undo" toast.
- `lib/hooks/use-logs.tsx`: `LogsProvider` holds today's logs for every tab, so a log added on Plates, Menus or Log shows up on Today without a refetch. `addLog` / `updateLog` / `deleteLog` are optimistic and roll back with an error toast if the API call fails.
- Free-food card: the next 1–2 events that haven't ended, with a "Fits your macros" / "Over your remaining" / "Calories unknown" badge based on `est_calories` vs remaining calories (`lib/events.ts`, `components/events/fit-badge.tsx`). If events fail to load, the card hides instead of erroring.
- Also added: `components/ui/toast.tsx`, `components/ui/stepper.tsx`, `lib/format.ts`.
- Tests: 31 passing.

## 2026-11-14 — Frontend phase 4: Plate picks and Menus (Claude Code, for Swagat)

- `/plates`: location chips (swipe-only plans see dining halls only; others also see retail), a Breakfast/Lunch/Dinner picker (disabled for retail, "Same menu all day"), skeleton cards with rotating copy while loading, and 2–3 plate cards. Each card shows its items with servings, the plate's protein/carbs/fat as bars against what's left today, and the AI reason. "Log this plate" logs every item (`source: "plate"`) and returns to `/today`. "Regenerate" sends `variant + 1`, and a "Browse the menu" link goes to `/menus`.
- AI fallback: if `POST /api/ai/plates` takes over 5 s or fails, the page builds plates locally from the real menu (`lib/plate-builder.ts`) and labels them "Offline estimate". The mock route uses the same builder.
- `lib/diet.ts`: diet and allergen filtering. Plates only use items that fit the user's diet tags and allergens. UTK data has no halal or pork flags, so "No pork" and "Halal" exclude pork by name (`TODO(schema)`).
- `/menus`: location chips, meal-period picker, search, and diet filter chips (the user's own diet is preselected). Items are grouped by station with calories, P/C/F, diet badges, price for retail, and a warning icon when an item contains one of the user's allergens. Tapping an item opens a sheet with full macros, allergens, a 0.5-step servings stepper and "Log". Empty states: "Menu not posted yet" and "Nothing matches your search or filters".
- `PROPOSED` for Aarohan: `POST /api/ai/plates` body `{ location_id, meal_period, remaining, variant? }` (`PlatesBody` in `lib/api.ts`).
- `TODO(nearest)`: Plates defaults to the first dining hall, since there's no location data yet.
- Fixed while testing:
  - Logging a plate showed one item three times on Today: the optimistic placeholders had the same temporary ID. They now use `crypto.randomUUID()`.
  - The page was 497px wide on phones because a `<fieldset>` defaults to `min-width: min-content`. Added `min-w-0` to the chip fieldsets.
- Tests: 36 passing.
