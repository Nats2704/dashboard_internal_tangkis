"use client";

import { useMemo, useState } from "react";
import type { VendorRequest } from "@/types/vendor";
import { useReferenceData } from "@/components/providers/ReferenceDataProvider";
import { Panel, SectionHeader } from "@/components/ui/Panel";
import { SearchInput } from "@/components/ui/SearchInput";
import { DataTable } from "@/components/ui/DataTable";
import { VENDOR_SERVICE } from "@/lib/constants/status";
import { formatRupiahShort } from "@/lib/utils/format";
import { VendorSummaryStrip } from "@/components/dashboard/VendorOverview";
import { VendorWorkspace } from "./VendorWorkspace";

export function VendorsView({ requests }: { requests: VendorRequest[] }) {
  const { vendors } = useReferenceData();
  const [query, setQuery] = useState("");

  const vendorRows = useMemo(
    () =>
      vendors.map((v) => {
        const own = requests.filter((r) => r.vendorId === v.id);
        return {
          ...v,
          jobs: own.length,
          value: own.reduce((s, r) => s + r.jobValue, 0),
          commission: own.filter((r) => r.status === "done").reduce((s, r) => s + r.commission, 0),
        };
      }),
    [vendors, requests]
  );

  return (
    <div className="space-y-4 lg:space-y-5">
      <Panel labelledBy="rujukan-title">
        <SectionHeader
          id="rujukan-title"
          title="Permintaan rujukan"
          description="Klik baris untuk melihat vendor, nilai pekerjaan, dan progres."
          actions={<SearchInput value={query} onChange={setQuery} placeholder="Cari unit atau no. rujukan" label="Cari rujukan" />}
        />
        <VendorSummaryStrip requests={requests} />
        <VendorWorkspace requests={requests} pageSize={15} query={query} />
      </Panel>
      <Panel labelledBy="mitra-title">
        <SectionHeader id="mitra-title" title="Mitra vendor" description="Kinerja rujukan per mitra kuartal ini." />
        <DataTable
          rows={vendorRows}
          getRowId={(v) => v.id}
          caption="Mitra vendor"
          initialSort={{ key: "value", direction: "desc" }}
          columns={[
            { key: "name", header: "Vendor", sortValue: (v) => v.name, cell: (v) => <span className="font-medium text-ink">{v.name}</span> },
            { key: "service", header: "Layanan", cell: (v) => VENDOR_SERVICE[v.service] },
            { key: "city", header: "Kota", hideBelow: "md", cell: (v) => <span className="text-muted">{v.city}</span> },
            { key: "contact", header: "Kontak", hideBelow: "lg", cell: (v) => <span className="text-muted">{v.contact}</span> },
            { key: "jobs", header: "Rujukan", align: "right", sortValue: (v) => v.jobs, cell: (v) => v.jobs },
            { key: "value", header: "Nilai pekerjaan", align: "right", sortValue: (v) => v.value, cell: (v) => formatRupiahShort(v.value) },
            { key: "commission", header: "Komisi diterima", align: "right", sortValue: (v) => v.commission, cell: (v) => formatRupiahShort(v.commission) },
          ]}
        />
      </Panel>
    </div>
  );
}
