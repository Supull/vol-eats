import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

/** Heading, body and the Back/Next bar shared by every onboarding step. */
export function StepShell({
  title,
  subtitle,
  formId,
  onBack,
  nextLabel = "Next",
  busy,
  children,
}: {
  title: string;
  subtitle?: string;
  formId: string;
  onBack?: () => void;
  nextLabel?: string;
  busy?: boolean;
  children: ReactNode;
}) {
  return (
    <>
      <div className="flex-1 space-y-6 pb-28">
        <div>
          <h1 className="font-display text-2xl font-bold">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
        </div>
        {children}
      </div>
      <div className="fixed inset-x-0 bottom-0 border-t bg-surface pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-(--content-max) gap-3 px-4 py-3">
          {onBack ? (
            <Button variant="secondary" size="lg" onClick={onBack} disabled={busy}>
              Back
            </Button>
          ) : null}
          <Button type="submit" form={formId} size="lg" block disabled={busy}>
            {nextLabel}
          </Button>
        </div>
      </div>
    </>
  );
}
