import type { ReactNode } from "react";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return <main className="mx-auto flex min-h-dvh max-w-(--content-max) flex-col px-4 pt-6">{children}</main>;
}
