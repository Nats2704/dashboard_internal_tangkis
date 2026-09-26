"use client";

import type { InventoryRecord } from "@/types/inventory";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { LIFECYCLE } from "@/lib/constants/status";
import { formatDate, formatRelative } from "@/lib/utils/format";

interface InventoryTableProps {
  records: InventoryRecord[];
  onSelect: (record: InventoryRecord) => void;
  selectedId?: string | null;
  pageSize?: number;
}

export function InventoryTable({ records, onSelect, selectedId, pageSize }: InventoryTableProps) {
  const columns: Column<InventoryRecord>[] = [
    {
      key: "unit",
      header: "Unit",
      sortValue: (r) => r.deviceId,
      cell: (r) => <span className="font-medium text-ink">{r.deviceId}</span>,
    },
    {
      key: "stage",
      header: "Status",
      cell: (r) => <Badge tone={LIFECYCLE[r.stage].tone}>{LIFECYCLE[r.stage].label}</Badge>,
    },
    {
      key: "location",
      header: "Lokasi",
      sortValue: (r) => r.location,
      cell: (r) => <span className="block max-w-[220px] truncate">{r.location}</span>,
    },
    {
      key: "since",
      header: "Sejak",
      sortValue: (r) => -Date.parse(r.since),
      cell: (r) => (
        <span className="tabular" title={formatDate(r.since)}>
          {formatRelative(r.since)}
        </span>
      ),
    },
    {
      key: "note",
      header: "Catatan",
      hideBelow: "xl",
      cell: (r) => <span className="block max-w-[320px] truncate text-muted">{r.note}</span>,
    },
  ];

  return (
    <DataTable
      rows={records}
      columns={columns}
      getRowId={(r) => r.deviceId}
      caption="Stok perangkat per tahap siklus"
      onRowClick={onSelect}
      selectedId={selectedId}
      pageSize={pageSize}
    />
  );
}
