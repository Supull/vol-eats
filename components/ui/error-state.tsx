import { errorMessage } from "@/lib/errors";
import { Button } from "./button";

export function ErrorState({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-lg border bg-surface p-5 text-center">
      <p className="text-sm text-muted">{errorMessage(error)}</p>
      <Button variant="secondary" className="mt-3" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
