"use client";

import { useEffect, useState } from "react";
import { Clock, MapPin, PartyPopper } from "lucide-react";
import { FitBadge } from "@/components/events/fit-badge";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { fitStatus, isHappeningNow, upcomingEvents } from "@/lib/events";
import { formatTime } from "@/lib/format";
import { useLogs } from "@/lib/hooks/use-logs";
import { useProfile } from "@/lib/hooks/use-profile";
import { remaining, targetsOf } from "@/lib/macros";
import { schoolDate } from "@/lib/meal-period";
import type { Event } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function EventsPage() {
  const { profile } = useProfile();
  const { eaten } = useLogs();
  const [events, setEvents] = useState<Event[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api
      .events({ date: schoolDate() })
      .then((e) => !cancelled && setEvents(e))
      .catch((e: unknown) => !cancelled && setError(e));
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const left = profile ? remaining(targetsOf(profile), eaten).calories : null;
  const upcoming = events ? upcomingEvents(events) : [];
  const past = events ? events.filter((e) => !upcoming.includes(e)) : [];

  return (
    <div className="space-y-4">
      <PageHeader title="Free food" subtitle="Campus events serving food today" />

      {error ? (
        <ErrorState
          error={error}
          onRetry={() => {
            setError(null);
            setAttempt((a) => a + 1);
          }}
        />
      ) : !events ? (
        <div className="space-y-3" aria-busy="true" aria-label="Loading events">
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-surface p-6 text-center">
          <PartyPopper aria-hidden className="mx-auto size-6 text-muted" />
          <p className="mt-2 text-sm text-muted">No free food posted yet today. Check back later.</p>
        </div>
      ) : (
        <>
          {upcoming.length ? (
            <ul className="space-y-3">
              {upcoming.map((e) => (
                <EventCard key={e.id} event={e} remainingCalories={left} />
              ))}
            </ul>
          ) : (
            <p className="rounded-lg border border-dashed bg-surface p-6 text-center text-sm text-muted">That&apos;s all for today.</p>
          )}
          {past.length ? (
            <details className="text-sm">
              <summary className="flex min-h-11 cursor-pointer items-center text-muted">Earlier today ({past.length})</summary>
              <ul className="space-y-3 pt-2">
                {past.map((e) => (
                  <EventCard key={e.id} event={e} remainingCalories={null} ended />
                ))}
              </ul>
            </details>
          ) : null}
        </>
      )}
    </div>
  );
}

// Deliberately shows nothing about who posted the event.
function EventCard({ event: e, remainingCalories, ended }: { event: Event; remainingCalories: number | null; ended?: boolean }) {
  const now = isHappeningNow(e);
  return (
    <li className={cn("rounded-lg border bg-surface p-4 shadow-card", ended && "opacity-60 shadow-none")}>
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-semibold">{e.food_description}</h2>
        {e.est_calories != null ? <span className="shrink-0 text-sm font-semibold tabular-nums">~{e.est_calories} cal</span> : null}
      </div>
      <p className="mt-0.5 text-sm text-muted">{e.title}</p>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <span className="flex items-center gap-1">
          <Clock aria-hidden className="size-4 text-muted" />
          {now ? <span className="font-semibold text-success">Now ·</span> : null}
          {formatTime(e.starts_at)}
          {e.ends_at ? `–${formatTime(e.ends_at)}` : ""}
        </span>
        <span className="flex items-center gap-1">
          <MapPin aria-hidden className="size-4 text-muted" />
          {e.location_name}
        </span>
      </div>
      {!ended && remainingCalories != null ? (
        <div className="mt-3">
          <FitBadge status={fitStatus(e, remainingCalories)} />
        </div>
      ) : null}
    </li>
  );
}
