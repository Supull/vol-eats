"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Stepper } from "@/components/ui/stepper";
import { useLogs } from "@/lib/hooks/use-logs";
import type { FoodLog } from "@/lib/types";

export function EditLogSheet({ log, onClose }: { log: FoodLog | null; onClose: () => void }) {
  return (
    <Sheet open={log !== null} onClose={onClose} title={log?.name ?? "Edit"}>
      {/* key resets the servings state each time a different log opens */}
      {log ? <EditLogBody key={log.id} log={log} onClose={onClose} /> : null}
    </Sheet>
  );
}

function EditLogBody({ log, onClose }: { log: FoodLog; onClose: () => void }) {
  const { updateLog, deleteLog } = useLogs();
  const [servings, setServings] = useState(log.servings);

  const rows = [
    { label: "Calories", value: log.calories * servings, unit: "" },
    { label: "Protein", value: log.protein_g * servings, unit: "g" },
    { label: "Carbs", value: log.carbs_g * servings, unit: "g" },
    { label: "Fat", value: log.fat_g * servings, unit: "g" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Servings</span>
        <Stepper label="Servings" value={servings} onChange={setServings} />
      </div>
      <dl className="grid grid-cols-4 gap-2 rounded-md bg-surface-2 p-3 text-center">
        {rows.map((r) => (
          <div key={r.label}>
            <dt className="text-xs text-muted">{r.label}</dt>
            <dd className="font-semibold tabular-nums">
              {Math.round(r.value)}
              {r.unit}
            </dd>
          </div>
        ))}
      </dl>
      <div className="flex gap-3">
        <Button
          variant="secondary"
          size="lg"
          aria-label={`Delete ${log.name}`}
          className="text-danger"
          onClick={() => {
            onClose();
            void deleteLog(log.id);
          }}
        >
          <Trash2 aria-hidden className="size-4" /> Delete
        </Button>
        <Button
          size="lg"
          block
          disabled={servings === log.servings}
          onClick={() => {
            onClose();
            void updateLog(log.id, { servings });
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
