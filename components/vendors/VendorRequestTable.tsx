"use client";

import type { VendorRequest } from "@/types/vendor";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { VENDOR_SERVICE, VENDOR_STATUS } from "@/lib/constants/status";
import { formatDate, formatRupiahShort } from "@/lib/utils/format";

const STATUS_ORDER = { waiting: 0, in_progress: 1, done: 2 } as const;

interface VendorRequestTableProps {
  requests: VendorRequest[];
  onSelect: (request: VendorRequest) => void;
  selectedId?: string | null;
  pageSize?: number;
}

export function VendorRequestTable({ requests, onSelect, selectedId, pageSize }: VendorRequestTableProps) {
  const columns: Column<VendorRequest>[] = [
    {
      key: "request",
      header: "Permintaan",
      sortValue: (r) => VENDOR_SERVICE[r.service],
      cell: (r) => <span className="font-medium text-ink">{VENDOR_SERVICE[r.service]}</span>,
    },
    {
      key: "unit",
      header: "Unit",
      sortValue: (r) => r.deviceId,
      cell: (r) => <span className="font-mono text-[12.5px]">{r.deviceId}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortValue: (r) => STATUS_ORDER[r.status],
      cell: (r) => <Badge tone={VENDOR_STATUS[r.status].tone}>{VENDOR_STATUS[r.status].label}</Badge>,
    },
    {
      key: "commission",
      header: "Komisi",
      align: "right",
      sortValue: (r) => r.commission,
      cell: (r) => formatRupiahShort(r.commission),
    },
    {
      key: "date",
      header: "Tanggal",
      sortValue: (r) => Date.parse(r.requestedAt),
      cell: (r) => <span className="tabular">{formatDate(r.requestedAt)}</span>,
    },
  ];

  return (
    <DataTable
      rows={requests}
      columns={columns}
      getRowId={(r) => r.id}
      caption="Rujukan vendor"
      onRowClick={onSelect}
      selectedId={selectedId}
      pageSize={pageSize}
    />
  );
}
