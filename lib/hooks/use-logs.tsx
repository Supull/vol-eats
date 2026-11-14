"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import { sumLogs } from "@/lib/macros";
import { schoolDate } from "@/lib/meal-period";
import type { FoodLog, FoodLogInput, Macros } from "@/lib/types";
import { useProfile } from "./use-profile";

interface LogsState {
  logs: FoodLog[];
  eaten: Macros;
  loading: boolean;
  error: unknown;
  reload: () => void;
  addLog: (input: FoodLogInput) => Promise<FoodLog | null>;
  updateLog: (id: string, patch: Partial<FoodLogInput>) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
}

const LogsContext = createContext<LogsState | null>(null);

const stripServerFields = (log: FoodLog): FoodLogInput => {
  const { id, profile_id, ...rest } = log;
  void id;
  void profile_id;
  return rest;
};

/**
 * Today's food logs, shared by every tab so a log added on Plates/Menus/Log
 * shows up on Today without a refetch. Writes are optimistic and roll back on error.
 */
export function LogsProvider({ children }: { children: ReactNode }) {
  const { profile } = useProfile();
  const toast = useToast();
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [attempt, setAttempt] = useState(0);
  const profileId = profile?.id;

  useEffect(() => {
    if (!profileId) return;
    let cancelled = false;
    api
      .logs({ date: schoolDate() })
      .then((l) => !cancelled && setLogs(l))
      .catch((e: unknown) => !cancelled && setError(e))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [profileId, attempt]);

  const reload = useCallback(() => {
    setError(null);
    setLoading(true);
    setAttempt((a) => a + 1);
  }, []);

  const addLog = useCallback(
    async (input: FoodLogInput) => {
      const tempId = `temp-${Date.now()}`;
      const temp: FoodLog = { ...input, id: tempId, profile_id: profileId ?? "", logged_at: input.logged_at ?? new Date().toISOString() };
      setLogs((l) => [...l, temp]);
      try {
        const saved = await api.addLog(input);
        setLogs((l) => l.map((x) => (x.id === tempId ? saved : x)));
        return saved;
      } catch (e) {
        setLogs((l) => l.filter((x) => x.id !== tempId));
        toast(`Couldn't log that. ${errorMessage(e)}`, { tone: "error" });
        return null;
      }
    },
    [profileId, toast],
  );

  const updateLog = useCallback(
    async (id: string, patch: Partial<FoodLogInput>) => {
      let before: FoodLog | undefined;
      setLogs((l) =>
        l.map((x) => {
          if (x.id !== id) return x;
          before = x;
          return { ...x, ...patch };
        }),
      );
      try {
        const saved = await api.updateLog(id, patch);
        setLogs((l) => l.map((x) => (x.id === id ? saved : x)));
      } catch (e) {
        if (before) setLogs((l) => l.map((x) => (x.id === id ? before! : x)));
        toast(`Couldn't save that change. ${errorMessage(e)}`, { tone: "error" });
      }
    },
    [toast],
  );

  const deleteLog = useCallback(
    async (id: string) => {
      const removed = logs.find((x) => x.id === id);
      if (!removed) return;
      setLogs((l) => l.filter((x) => x.id !== id));
      try {
        await api.deleteLog(id);
        toast(`Removed ${removed.name}`, { action: { label: "Undo", onClick: () => void addLog(stripServerFields(removed)) } });
      } catch (e) {
        setLogs((l) => [...l, removed]);
        toast(`Couldn't remove that. ${errorMessage(e)}`, { tone: "error" });
      }
    },
    [logs, toast, addLog],
  );

  const eaten = useMemo(() => sumLogs(logs), [logs]);

  return (
    <LogsContext.Provider value={{ logs, eaten, loading: loading && !error, error, reload, addLog, updateLog, deleteLog }}>
      {children}
    </LogsContext.Provider>
  );
}

export function useLogs() {
  const ctx = useContext(LogsContext);
  if (!ctx) throw new Error("useLogs must be used inside <LogsProvider>");
  return ctx;
}
