import type { ReactNode } from "react";
import { BottomTabs } from "@/components/layout/bottom-tabs";
import { ProfileProvider } from "@/lib/hooks/use-profile";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ProfileProvider>
      <main className="mx-auto min-h-dvh max-w-(--content-max) px-4 pb-[calc(var(--tab-bar-height)+env(safe-area-inset-bottom)+24px)]">
        {children}
      </main>
      <BottomTabs />
    </ProfileProvider>
  );
}
