import type { ReactNode } from "react";
import { BottomTabs } from "@/components/layout/bottom-tabs";
import { ToastProvider } from "@/components/ui/toast";
import { LogsProvider } from "@/lib/hooks/use-logs";
import { ProfileProvider } from "@/lib/hooks/use-profile";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <ProfileProvider>
        <LogsProvider>
          <main className="mx-auto min-h-dvh max-w-(--content-max) px-4 pb-[calc(var(--tab-bar-height)+env(safe-area-inset-bottom)+24px)]">
            {children}
          </main>
          <BottomTabs />
        </LogsProvider>
      </ProfileProvider>
    </ToastProvider>
  );
}
