"use client";

import { Suspense, use, useState } from "react";
import { browser } from "react-dom";
import { useRouter } from "next/navigation";
import { FoodForm } from "@/components/log/food-form";
import { PhotoLog } from "@/components/log/photo-log";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useLogs } from "@/lib/hooks/use-logs";
import { currentMealPeriod } from "@/lib/meal-period";
import type { FoodLogInput } from "@/lib/types";
import { cn } from "@/lib/utils";

type Tab = "photo" | "quick";

export default function LogPage() {
  return (
    <Suspense fallback={<Skeleton className="mt-20 h-56 rounded-lg" />}>
      <LogScreen />
    </Suspense>
  );
}

function LogScreen() {
  use(browser("The log form defaults to the current meal period."));
  const router = useRouter();
  const toast = useToast();
  const { addLog } = useLogs();
  const [tab, setTab] = useState<Tab>("photo");
  const [busy, setBusy] = useState(false);
  const mealPeriod = currentMealPeriod();

  async function save(input: FoodLogInput) {
    setBusy(true);
    const saved = await addLog(input);
    if (saved) {
      toast(`Logged ${saved.name}`);
      router.push("/today");
    } else {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Log a meal" />
      <div role="tablist" aria-label="How to log" className="grid grid-cols-2 rounded-md border bg-surface p-1">
        {(
          [
            ["photo", "Photo"],
            ["quick", "Quick add"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            id={`tab-${value}`}
            aria-selected={tab === value}
            aria-controls={`panel-${value}`}
            onClick={() => setTab(value)}
            className={cn("min-h-10 rounded-sm text-sm transition-colors duration-150", tab === value ? "bg-surface-2 font-semibold" : "text-muted")}
          >
            {label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "photo" ? (
          <PhotoLog mealPeriod={mealPeriod} busy={busy} onSave={save} />
        ) : (
          <FoodForm idPrefix="quick" mealPeriod={mealPeriod} source="manual" submitLabel="Add to today" busy={busy} onSubmit={save} />
        )}
      </div>
    </div>
  );
}
