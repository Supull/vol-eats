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
