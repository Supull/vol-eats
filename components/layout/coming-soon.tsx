import { PageHeader } from "./page-header";

/** Temporary page body for screens built in later phases. */
export function ComingSoon({ title, phase, children }: { title: string; phase: number; children?: React.ReactNode }) {
  return (
    <>
      <PageHeader title={title} />
      <div className="rounded-lg border border-dashed bg-surface p-6 text-sm text-muted">
        {children ?? <>This screen is built in phase {phase}.</>}
      </div>
    </>
  );
}
