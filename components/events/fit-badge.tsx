import { Check, CircleHelp, TriangleAlert } from "lucide-react";
import type { FitStatus } from "@/lib/events";
import { cn } from "@/lib/utils";

const CONFIG: Record<FitStatus, { label: string; icon: typeof Check; className: string }> = {
  fits: { label: "Fits your macros", icon: Check, className: "text-success" },
  over: { label: "Over your remaining", icon: TriangleAlert, className: "text-warning" },
  unknown: { label: "Calories unknown", icon: CircleHelp, className: "text-muted" },
};

/** Icon + text, so color is never the only signal. */
export function FitBadge({ status }: { status: FitStatus }) {
  const { label, icon: Icon, className } = CONFIG[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium", className)}>
      <Icon aria-hidden className="size-3.5" />
      {label}
    </span>
  );
}
