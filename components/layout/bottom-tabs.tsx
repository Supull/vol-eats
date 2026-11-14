"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Camera, House, UtensilsCrossed, Wallet, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/today", label: "Today", icon: House },
  { href: "/menus", label: "Menus", icon: UtensilsCrossed },
  { href: "/log", label: "Log", icon: Camera },
  { href: "/budget", label: "Budget", icon: Wallet },
  { href: "/events", label: "Events", icon: CalendarDays },
];

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex h-(--tab-bar-height) max-w-(--content-max)">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const isLog = href === "/log";
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full min-h-11 flex-col items-center justify-center gap-0.5 text-xs transition-colors duration-200",
                  active ? "font-semibold text-text" : "text-muted",
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center rounded-full",
                    isLog ? "size-10 bg-primary text-primary-fg" : "size-6",
                  )}
                >
                  <Icon aria-hidden className="size-5" />
                </span>
                <span className={cn(isLog && "sr-only")}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
