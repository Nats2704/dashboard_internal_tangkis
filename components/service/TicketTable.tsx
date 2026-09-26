"use client";

import type { ServiceTicket } from "@/types/service";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { useReferenceData } from "@/components/providers/ReferenceDataProvider";
import { TICKET_CAUSE, TICKET_PRIORITY, TICKET_STATUS } from "@/lib/constants/status";
import { ticketTotalCost } from "@/lib/analytics/tickets";
import { formatDate, formatRupiahShort } from "@/lib/utils/format";

const STATUS_ORDER = { open: 0, in_progress: 1, completed: 2 } as const;
const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 } as const;

interface TicketTableProps {
  tickets: ServiceTicket[];
  onSelect: (ticket: ServiceTicket) => void;
  selectedId?: string | null;
  pageSize?: number;
}

export function TicketTable({ tickets, onSelect, selectedId, pageSize }: TicketTableProps) {
  const { technicianById } = useReferenceData();

  const columns: Column<ServiceTicket>[] = [
    {
      key: "date",
      header: "Tanggal",
      sortValue: (t) => Date.parse(t.createdAt),
      cell: (t) => <span className="tabular">{formatDate(t.createdAt)}</span>,
    },
    {
      key: "unit",
      header: "Unit",
      sortValue: (t) => t.deviceId,
      cell: (t) => (
        <span>
          <span className="font-medium text-ink">{t.deviceId}</span>
          <span className="ml-2 hidden text-[12px] text-subtle xl:inline">{t.id}</span>
        </span>
      ),
    },
    {
      key: "cause",
      header: "Penyebab",
      sortValue: (t) => TICKET_CAUSE[t.cause],
      cell: (t) => TICKET_CAUSE[t.cause],
    },
    {
      key: "priority",
      header: "Prioritas",
      hideBelow: "md",
      sortValue: (t) => PRIORITY_ORDER[t.priority],
      cell: (t) => (
        <span className={t.priority === "critical" ? "font-medium text-danger" : t.priority === "high" ? "text-warning" : "text-muted"}>
          {TICKET_PRIORITY[t.priority].label}
        </span>
      ),
    },
    {
      key: "technician",
      header: "Teknisi",
      hideBelow: "lg",
      sortValue: (t) => (t.technicianId ? technicianById.get(t.technicianId)?.name ?? "" : null),
      cell: (t) =>
        t.technicianId ? (
          technicianById.get(t.technicianId)?.name
        ) : (
          <span className="text-danger">Belum ditugaskan</span>
        ),
    },
    {
      key: "cost",
      header: "Biaya",
      align: "right",
      sortValue: (t) => ticketTotalCost(t),
      cell: (t) =>
        t.requiresVisit ? (
          formatRupiahShort(ticketTotalCost(t))
        ) : (
          <span className="text-subtle">Remote</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      sortValue: (t) => STATUS_ORDER[t.status],
      cell: (t) => <Badge tone={TICKET_STATUS[t.status].tone}>{TICKET_STATUS[t.status].label}</Badge>,
    },
  ];

  return (
    <DataTable
      rows={tickets}
      columns={columns}
      getRowId={(t) => t.id}
      caption="Tiket servis"
      onRowClick={onSelect}
      selectedId={selectedId}
      pageSize={pageSize}
    />
  );
}
