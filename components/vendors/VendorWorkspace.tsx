"use client";

import { useMemo, useState } from "react";
import type { VendorRequest, VendorRequestStatus } from "@/types/vendor";
import { Tabs } from "@/components/ui/Tabs";
import { VendorRequestTable } from "./VendorRequestTable";
import { VendorRequestDrawer } from "./VendorRequestDrawer";

type Filter = "all" | VendorRequestStatus;

export function VendorWorkspace({ requests, pageSize, query = "" }: { requests: VendorRequest[]; pageSize: number; query?: string }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const count = (status: VendorRequestStatus) => requests.filter((r) => r.status === status).length;
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return requests
      .filter((r) => filter === "all" || r.status === filter)
      .filter((r) => !q || `${r.id} ${r.deviceId}`.toLowerCase().includes(q));
  }, [requests, filter, query]);
  const selected = selectedId ? requests.find((r) => r.id === selectedId) ?? null : null;

  return (
    <div>
      <div className="px-5 pt-4 pb-3">
        <Tabs
          label="Filter status rujukan"
          value={filter}
          onChange={setFilter}
          items={[
            { value: "all", label: "Semua", count: requests.length },
            { value: "waiting", label: "Menunggu", count: count("waiting") },
            { value: "in_progress", label: "Dalam Proses", count: count("in_progress") },
            { value: "done", label: "Selesai", count: count("done") },
          ]}
        />
      </div>
      <div className="border-t border-line">
        <VendorRequestTable
          key={`${filter}-${query}`}
          requests={rows}
          onSelect={(r) => setSelectedId(r.id)}
          selectedId={selectedId}
          pageSize={pageSize}
        />
      </div>
      <VendorRequestDrawer request={selected} onClose={() => setSelectedId(null)} />
    </div>
  );
}
