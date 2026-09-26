"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { ServiceTicket } from "@/types/service";

interface TicketContextValue {
  tickets: ServiceTicket[];
  ticketsByDevice: Map<string, ServiceTicket[]>;
  applyAssignment: (ticketId: string, technicianId: string, visitDate: string) => void;
}

const TicketContext = createContext<TicketContextValue | null>(null);

export function TicketProvider({
  initialTickets,
  children,
}: {
  initialTickets: ServiceTicket[];
  children: ReactNode;
}) {
  const [tickets, setTickets] = useState(initialTickets);

  const applyAssignment = useCallback(
    (ticketId: string, technicianId: string, visitDate: string) => {
      setTickets((list) =>
        list.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                technicianId,
                visitDate: t.requiresVisit ? visitDate : t.visitDate,
                status: t.status === "open" ? "in_progress" : t.status,
              }
            : t
        )
      );
    },
    []
  );

  const value = useMemo(() => {
    const byDevice = new Map<string, ServiceTicket[]>();
    for (const t of tickets) {
      const list = byDevice.get(t.deviceId) ?? [];
      list.push(t);
      byDevice.set(t.deviceId, list);
    }
    return { tickets, ticketsByDevice: byDevice, applyAssignment };
  }, [tickets, applyAssignment]);

  return <TicketContext.Provider value={value}>{children}</TicketContext.Provider>;
}

export function useTickets(): TicketContextValue {
  const context = useContext(TicketContext);
  if (!context) throw new Error("useTickets harus dipakai di dalam TicketProvider");
  return context;
}
