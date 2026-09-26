"use client";

import type { Contract } from "@/types/contract";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { useReferenceData } from "@/components/providers/ReferenceDataProvider";
import { OWNERSHIP, WARRANTY } from "@/lib/constants/status";
import { warrantyState } from "@/lib/analytics/contracts";
import { daysUntil, formatDate, formatDaysLeft } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface ContractTableProps {
  contracts: Contract[];
  onSelect: (contract: Contract) => void;
  selectedId?: string | null;
  pageSize?: number;
}

export function ContractTable({ contracts, onSelect, selectedId, pageSize }: ContractTableProps) {
  const { customerById, buildingById } = useReferenceData();

  const columns: Column<Contract>[] = [
    {
      key: "unit",
      header: "Unit",
      sortValue: (c) => c.deviceId,
      cell: (c) => <span className="font-medium text-ink">{c.deviceId}</span>,
    },
    {
      key: "customer",
      header: "Pelanggan",
      sortValue: (c) => customerById.get(c.customerId)?.name ?? "",
      cell: (c) => (
        <span className="block max-w-[260px] truncate" title={buildingById.get(c.buildingId)?.name}>
          {customerById.get(c.customerId)?.name}
        </span>
      ),
    },
    {
      key: "ownership",
      header: "Kepemilikan",
      hideBelow: "md",
      sortValue: (c) => c.ownership,
      cell: (c) => (
        <span className={cn(c.ownership === "rental" ? "text-info" : "text-ink-2")}>{OWNERSHIP[c.ownership].label}</span>
      ),
    },
    {
      key: "start",
      header: "Mulai Kontrak",
      hideBelow: "lg",
      sortValue: (c) => Date.parse(c.startDate),
      cell: (c) => <span className="tabular">{formatDate(c.startDate)}</span>,
    },
    {
      key: "warranty",
      header: "Garansi",
      sortValue: (c) => Date.parse(c.warrantyEnd),
      cell: (c) => {
        const state = warrantyState(c);
        return (
          <span className="inline-flex items-center gap-2">
            <span className={cn("tabular", state === "expired" && "text-subtle")}>{formatDate(c.warrantyEnd)}</span>
            {state !== "active" ? (
              <Badge tone={WARRANTY[state].tone} className="text-[12px]">
                {state === "expiring" ? formatDaysLeft(c.warrantyEnd) : WARRANTY[state].label}
              </Badge>
            ) : null}
          </span>
        );
      },
    },
    {
      key: "due",
      header: "Jatuh Tempo",
      sortValue: (c) => Date.parse(c.dueDate),
      cell: (c) => {
        const soon = daysUntil(c.dueDate) <= 90;
        return (
          <span className="inline-flex items-center gap-2">
            <span className="tabular">{formatDate(c.dueDate)}</span>
            {soon ? <span className="text-[12px] text-warning">{formatDaysLeft(c.dueDate)}</span> : null}
          </span>
        );
      },
    },
  ];

  return (
    <DataTable
      rows={contracts}
      columns={columns}
      getRowId={(c) => c.id}
      caption="Kontrak dan kepemilikan unit"
      onRowClick={onSelect}
      selectedId={selectedId}
      pageSize={pageSize}
    />
  );
}
