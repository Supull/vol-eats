import type { Macros } from "@/lib/types";
import { MacroRing } from "./macro-ring";

const SMALL = [
  { key: "protein_g", label: "Protein", stroke: "stroke-protein", dot: "bg-protein" },
  { key: "carbs_g", label: "Carbs", stroke: "stroke-carbs", dot: "bg-carbs" },
  { key: "fat_g", label: "Fat", stroke: "stroke-fat", dot: "bg-fat" },
] as const;

const fmt = (n: number) => Math.round(n).toLocaleString();

export function MacroSummary({ eaten, targets }: { eaten: Macros; targets: Macros }) {
  const calLeft = targets.calories - eaten.calories;

  return (
    <section aria-labelledby="macros-heading" className="rounded-lg border bg-surface p-4 shadow-card">
      <h2 id="macros-heading" className="sr-only">
        Today&apos;s macros
      </h2>
      <div className="flex items-center gap-5">
        <MacroRing value={eaten.calories} target={targets.calories} size={136} stroke={12} colorClass="stroke-calories">
          <span className="font-display text-3xl font-bold tabular-nums">{fmt(Math.abs(calLeft))}</span>
          <span className="text-xs text-muted">{calLeft >= 0 ? "cal left" : "cal over"}</span>
        </MacroRing>
        <dl className="flex-1 space-y-1 text-sm">
          <dt className="text-muted">Calories</dt>
          <dd className="text-lg font-semibold tabular-nums">
            {fmt(eaten.calories)} <span className="text-sm font-normal text-muted">/ {fmt(targets.calories)}</span>
          </dd>
        </dl>
      </div>

      <ul className="mt-5 grid grid-cols-3 gap-2">
        {SMALL.map((m) => {
          const left = targets[m.key] - eaten[m.key];
          return (
            <li key={m.key} className="flex flex-col items-center text-center">
              <MacroRing value={eaten[m.key]} target={targets[m.key]} size={64} stroke={7} colorClass={m.stroke}>
                <span className="text-sm font-bold tabular-nums">{fmt(eaten[m.key])}</span>
              </MacroRing>
              <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold">
                <span aria-hidden className={`size-2 rounded-full ${m.dot}`} />
                {m.label}
              </p>
              <p className="text-xs tabular-nums text-muted">
                {fmt(eaten[m.key])} / {fmt(targets[m.key])} g
              </p>
              <p className={`text-xs tabular-nums ${left < 0 ? "text-warning" : "text-muted"}`}>
                {left >= 0 ? `${fmt(left)} g left` : `${fmt(-left)} g over`}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
