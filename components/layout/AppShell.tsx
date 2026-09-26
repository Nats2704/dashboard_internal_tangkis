"use client";

import { useCallback, useState, type ReactNode } from "react";
import type { Device } from "@/types/device";
import type { ServiceTicket } from "@/types/service";
import type { AppNotification, SearchEntry } from "@/types/notification";
import { useDismiss } from "@/lib/hooks/useDismiss";
import { cn } from "@/lib/utils/cn";
import { FleetProvider } from "@/components/providers/FleetProvider";
import { TicketProvider } from "@/components/providers/TicketProvider";
import { ReferenceDataProvider, type ReferenceData } from "@/components/providers/ReferenceDataProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface AppShellProps {
  children: ReactNode;
  reference: ReferenceData;
  devices: Device[];
  tickets: ServiceTicket[];
  notifications: AppNotification[];
  searchEntries: SearchEntry[];
}

export function AppShell({ children, reference, devices, tickets, notifications, searchEntries }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  useDismiss(mobileOpen, closeMobile);

  return (
    <ReferenceDataProvider data={reference}>
      <FleetProvider initialDevices={devices}>
        <TicketProvider initialTickets={tickets}>
          <ToastProvider>
            <a
              href="#konten"
              className="sr-only z-[80] rounded-md bg-surface px-3 py-2 text-sm focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
            >
              Lewati ke konten
            </a>
            <Sidebar
              collapsed={collapsed}
              onToggleCollapse={() => setCollapsed((v) => !v)}
              mobileOpen={mobileOpen}
              onMobileClose={closeMobile}
            />
            <div
              className={cn(
                "flex min-h-screen flex-col transition-[padding] duration-200 ease-out",
                collapsed ? "lg:pl-[68px]" : "lg:pl-[248px]"
              )}
            >
              <Header
                onOpenMenu={() => setMobileOpen(true)}
                searchEntries={searchEntries}
                notifications={notifications}
              />
              <main id="konten" className="flex-1">
                {children}
              </main>
            </div>
          </ToastProvider>
        </TicketProvider>
      </FleetProvider>
    </ReferenceDataProvider>
  );
}
