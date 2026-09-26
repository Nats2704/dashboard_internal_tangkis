"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Contract } from "@/types/contract";
import type { Sensor } from "@/types/sensor";
import { useReferenceData } from "@/components/providers/ReferenceDataProvider";
import { summarizeContracts } from "@/lib/analytics/contracts";
import { Panel, SectionHeader } from "@/components/ui/Panel";
import { Metric } from "@/components/ui/Metric";
import { SearchInput } from "@/components/ui/SearchInput";
import { DataTable } from "@/components/ui/DataTable";
import { ContractWorkspace, type ContractFilter } from "./ContractWorkspace";

const VALID: ContractFilter[] = ["all", "owned", "rental", "expiring", "due"];

export function ContractsView({ contracts, sensors }: { contracts: Contract[]; sensors: Sensor[] }) {
  const params = useSearchParams();
  const initial = params.get("filter") as ContractFilter | null;
  const [filter, setFilter] = useState<ContractFilter>(initial && VALID.includes(initial) ? initial : "all");
  const [query, setQuery] = useState("");
  const { customers, buildings } = useReferenceData();
  const summary = useMemo(() => summarizeContracts(contracts), [contracts]);

  const customerRows = useMemo(
    () =>
      customers
        .map((c) => {
          const own = contracts.filter((k) => k.customerId === c.id);
          return {
            id: c.id,
            name: c.name,
            buildings: buildings.filter((b) => b.customerId === c.id).map((b) => b.name).join(", "),
            units: own.length,
            ownership: own.length ? (own[0].ownership === "rental" ? "Sewa" : "Milik pelanggan") : "Kontrak berakhir",
          };
        })
        .sort((a, b) => b.units - a.units),
    [customers, contracts, buildings]
  );

  return (
    <div className="space-y-12">
      <Panel labelledBy="ringkasan-kontrak">
        <SectionHeader id="ringkasan-kontrak" title="Ringkasan kontrak" />
        <div className="grid grid-cols-2 lg:grid-cols-5 [&>*]:border-line [&>*]:px-5 [&>*]:py-4">
          <Metric label="Kontrak aktif" value={summary.total} unit="unit" />
          <Metric className="border-l" label="Milik pelanggan" value={summary.owned} unit="unit" />
          <Metric className="border-t lg:border-t-0 lg:border-l" label="Sewa" value={summary.rental} unit="unit" />
          <Metric className="border-t border-l lg:border-t-0" label="Garansi hampir habis" value={summary.warrantyExpiring} unit="unit" tone="warning" hint="≤ 60 hari" />
          <Metric className="border-t lg:border-t-0 lg:border-l" label="Jatuh tempo ≤ 90 hari" value={summary.dueWithin90Days} unit="unit" />
        </div>
      </Panel>

      <Panel labelledBy="daftar-kontrak">
        <SectionHeader
          id="daftar-kontrak"
          title="Kontrak per unit"
          description="Klik baris untuk melihat detail unit dan kontraknya."
          actions={<SearchInput value={query} onChange={setQuery} placeholder="Cari unit atau no. kontrak" label="Cari kontrak" />}
        />
        <ContractWorkspace contracts={contracts} sensors={sensors} filter={filter} onFilterChange={setFilter} pageSize={15} query={query} />
      </Panel>

      <Panel labelledBy="daftar-pelanggan">
        <SectionHeader id="daftar-pelanggan" title="Pelanggan" description={`${customers.length} pelanggan, diurutkan menurut jumlah unit aktif.`} />
        <DataTable
          rows={customerRows}
          getRowId={(r) => r.id}
          caption="Daftar pelanggan"
          columns={[
            { key: "name", header: "Pelanggan", sortValue: (r) => r.name, cell: (r) => <span className="font-medium text-ink">{r.name}</span> },
            { key: "buildings", header: "Gedung", hideBelow: "md", cell: (r) => <span className="block max-w-[360px] truncate text-muted">{r.buildings}</span> },
            { key: "ownership", header: "Skema", cell: (r) => r.ownership },
            { key: "units", header: "Unit aktif", align: "right", sortValue: (r) => r.units, cell: (r) => r.units },
          ]}
        />
      </Panel>
    </div>
  );
}
