"use client";

import { useMemo, useState } from "react";
import type { ServiceTicket, TicketStatus } from "@/types/service";
import { Tabs } from "@/components/ui/Tabs";
import { useTickets } from "@/components/providers/TicketProvider";
import { TicketTable } from "./TicketTable";
import { TicketDetailDrawer } from "./TicketDetailDrawer";
import { AssignTechnicianModal } from "./AssignTechnicianModal";

export type TicketFilter = "all" | TicketStatus;

const STATUS_ORDER: Record<TicketStatus, number> = { open: 0, in_progress: 1, completed: 2 };

interface ServiceWorkspaceProps {
  pageSize: number;
  initialFilter?: TicketFilter;
  initialTicketId?: string | null;
  query?: string;
}

export function ServiceWorkspace({ pageSize, initialFilter = "all", initialTicketId = null, query = "" }: ServiceWorkspaceProps) {
  const { tickets } = useTickets();
  const [filter, setFilter] = useState<TicketFilter>(initialFilter);
  const [selectedId, setSelectedId] = useState<string | null>(initialTicketId);
  const [assigning, setAssigning] = useState<ServiceTicket | null>(null);

  const counts = useMemo(
    () => ({
      all: tickets.length,
      open: tickets.filter((t) => t.status === "open").length,
      in_progress: tickets.filter((t) => t.status === "in_progress").length,
      completed: tickets.filter((t) => t.status === "completed").length,
    }),
    [tickets]
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets
      .filter((t) => filter === "all" || t.status === filter)
      .filter((t) => !q || `${t.id} ${t.deviceId} ${t.problem}`.toLowerCase().includes(q))
      .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }, [tickets, filter, query]);

  const selected = selectedId ? tickets.find((t) => t.id === selectedId) ?? null : null;

  return (
    <div>
      <div className="px-5 pt-4 pb-3">
        <Tabs
          label="Filter status tiket"
          value={filter}
          onChange={setFilter}
          items={[
            { value: "all", label: "Semua", count: counts.all },
            { value: "open", label: "Open", count: counts.open },
            { value: "in_progress", label: "In Progress", count: counts.in_progress },
            { value: "completed", label: "Completed", count: counts.completed },
          ]}
        />
      </div>
      <div className="border-t border-line">
        <TicketTable
          key={`${filter}-${query}`}
          tickets={rows}
          onSelect={(t) => setSelectedId(t.id)}
          selectedId={selectedId}
          pageSize={pageSize}
        />
      </div>
      <TicketDetailDrawer ticket={selected} onClose={() => setSelectedId(null)} onAssign={setAssigning} />
      {assigning ? (
        <AssignTechnicianModal key={assigning.id} ticket={assigning} onClose={() => setAssigning(null)} />
      ) : null}
    </div>
  );
}
