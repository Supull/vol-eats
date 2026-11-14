"use client";

import Link from "next/link";
import { LogOut, Sparkles, UtensilsCrossed } from "lucide-react";
import { FreeFoodCard } from "@/components/today/free-food-card";
import { LoggedMeals } from "@/components/today/logged-meals";
import { MacroSummary } from "@/components/today/macro-summary";
import { buttonVariants } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatLongDate, greeting } from "@/lib/format";
import { useLogs } from "@/lib/hooks/use-logs";
import { useProfile } from "@/lib/hooks/use-profile";
import { remaining, targetsOf } from "@/lib/macros";
import { currentMealPeriod, MEAL_PERIOD_LABELS } from "@/lib/meal-period";

export default function TodayPage() {
  const { profile, loading: profileLoading, error: profileError, reload: reloadProfile, signOut } = useProfile();
  const { logs, eaten, loading: logsLoading, error: logsError, reload: reloadLogs } = useLogs();

  if (profileError) {
    return (
      <div className="pt-10">
        <ErrorState error={profileError} onRetry={reloadProfile} />
      </div>
    );
  }
  if (profileLoading || !profile) return <TodaySkeleton />;

  const targets = targetsOf(profile);
  const left = remaining(targets, eaten);
  const period = currentMealPeriod();
  const firstName = profile.display_name?.split(" ")[0];

  return (
    <div className="space-y-5 pt-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{formatLongDate()}</p>
          <h1 className="font-display text-2xl font-bold">
            {greeting()}
            {firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium">
            <span aria-hidden className="size-1.5 rounded-full bg-success" />
            {MEAL_PERIOD_LABELS[period]} is being served
          </p>
        </div>
        <button
          type="button"
          onClick={signOut}
          aria-label="Sign out"
          className="flex size-11 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-text"
        >
          <LogOut aria-hidden className="size-5" />
        </button>
      </header>

      {logsError ? (
        <ErrorState error={logsError} onRetry={reloadLogs} />
      ) : logsLoading ? (
        <Skeleton className="h-64 rounded-lg" />
      ) : (
        <MacroSummary eaten={eaten} targets={targets} />
      )}

      <Link href="/plates" className={buttonVariants({ size: "lg", block: true, className: "shadow-card" })}>
        <Sparkles aria-hidden className="size-5" /> What should I eat?
      </Link>

      <FreeFoodCard remainingCalories={left.calories} />

      {logsError || logsLoading ? null : logs.length ? (
        <LoggedMeals logs={logs} />
      ) : (
        <section className="rounded-lg border border-dashed bg-surface p-6 text-center">
          <UtensilsCrossed aria-hidden className="mx-auto size-6 text-muted" />
          <p className="mt-2 text-sm text-muted">Nothing logged yet. Tap &ldquo;What should I eat?&rdquo; or log a meal.</p>
          <Link href="/log" className={buttonVariants({ variant: "secondary", size: "sm", className: "mt-3" })}>
            Log a meal
          </Link>
        </section>
      )}
    </div>
  );
}

function TodaySkeleton() {
  return (
    <div className="space-y-5 pt-6" aria-busy="true" aria-label="Loading today">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-64 rounded-lg" />
      <Skeleton className="h-12" />
      <Skeleton className="h-32 rounded-lg" />
    </div>
  );
}
