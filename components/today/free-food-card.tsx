"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, PartyPopper } from "lucide-react";
import { FitBadge } from "@/components/events/fit-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { fitStatus, isHappeningNow, upcomingEvents } from "@/lib/events";
import { formatTime } from "@/lib/format";
import { schoolDate } from "@/lib/meal-period";
import type { Event } from "@/lib/types";

/** Next 1–2 free-food events today. Hides itself quietly if events fail to load (not core to Today). */
export function FreeFoodCard({ remainingCalories }: { remainingCalories: number }) {
  const [events, setEvents] = useState<Event[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .events({ date: schoolDate() })
      .then((e) => !cancelled && setEvents(upcomingEvents(e).slice(0, 2)))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed || (events && events.length === 0)) return null;

  return (
    <section aria-labelledby="free-food-heading" className="rounded-lg border bg-surface p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="free-food-heading" className="flex items-center gap-2 font-display text-lg font-bold">
          <PartyPopper aria-hidden className="size-5 text-primary" /> Free food today
        </h2>
        <Link href="/events" className="flex min-h-11 items-center gap-0.5 text-sm font-medium text-muted hover:text-text">
          See all <ChevronRight aria-hidden className="size-4" />
        </Link>
      </div>
      {events === null ? (
        <div className="space-y-3" aria-busy="true" aria-label="Loading events">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : (
        <ul className="space-y-3">
          {events.map((e) => (
            <li key={e.id} className="space-y-1">
              <p className="text-sm font-semibold">{e.food_description}</p>
              <p className="text-xs text-muted">
                {isHappeningNow(e) ? <span className="font-semibold text-success">Happening now · </span> : null}
                {formatTime(e.starts_at)} · {e.location_name}
                {e.est_calories != null ? ` · ~${e.est_calories} cal` : null}
              </p>
              <FitBadge status={fitStatus(e, remainingCalories)} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
