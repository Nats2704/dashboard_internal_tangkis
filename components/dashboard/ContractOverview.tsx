"use client";

import { useMemo, useRef, useState } from "react";
import { ShieldAlert } from "lucide-react";
import type { Contract } from "@/types/contract";
import type { Sensor } from "@/types/sensor";
import { summarizeContracts } from "@/lib/analytics/contracts";
import { WARRANTY_ALERT_DAYS } from "@/lib/constants";
import { formatPercent } from "@/lib/utils/format";
import { Panel, SectionHeader, SubHeading } from "@/components/ui/Panel";
import { SegmentBar } from "@/components/ui/Meter";
import { Metric } from "@/components/ui/Metric";
import { cn } from "@/lib/utils/cn";
import { ContractWorkspace, type ContractFilter } from "@/components/contracts/ContractWorkspace";

export function ContractOverview({ contracts, sensors }: { contracts: Contract[]; sensors: Sensor[] }) {
  const [filter, setFilter] = useState<ContractFilter>("all");
  const tableRef = useRef<HTMLDivElement>(null);
  const summary = useMemo(() => summarizeContracts(contracts), [contracts]);
  const ownedPct = (summary.owned / Math.max(1, summary.total)) * 100;

  function showExpiring() {
    setFilter((f) => (f === "expiring" ? "all" : "expiring"));
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  return (
    <Panel id="kontrak" labelledBy="kontrak-title">
      <SectionHeader
        id="kontrak-title"
        title="Kontrak dan Kepemilikan"
        description={`${summary.total} unit dengan kontrak aktif (terpasang atau sedang diperbaiki).`}
        href="/contracts"
        linkLabel="Lihat semua kontrak"
      />
      <div className="grid xl:grid-cols-[300px_minmax(0,1fr)]">
        <div className="divide-y divide-line border-b border-line xl:border-r xl:border-b-0">
          <div className="px-5 py-4">
            <SubHeading>Kepemilikan unit</SubHeading>
            <div className="grid grid-cols-2 gap-4">
              <Metric label="Milik pelanggan" value={summary.owned} unit="unit" />
              <Metric label="Sewa" value={summary.rental} unit="unit" />
            </div>
            <SegmentBar
              className="mt-3"
              label="Proporsi milik pelanggan dan sewa"
              segments={[
                { key: "owned", label: "Milik pelanggan", value: summary.owned, className: "bg-ink-2/70" },
                { key: "rental", label: "Sewa", value: summary.rental, className: "bg-info/70" },
              ]}
            />
            <p className="mt-2 text-[12px] text-muted">
              {formatPercent(ownedPct, 0)} dibeli putus, sisanya disewa per bulan.
            </p>
          </div>

          <div className="px-5 py-4">
            <button
              type="button"
              onClick={showExpiring}
              aria-pressed={filter === "expiring"}
              className="group flex w-full items-start gap-2.5 text-left"
            >
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning" />
              <span>
                <span className="block text-[14px] font-medium text-ink">Garansi hampir habis</span>
                <span className="mt-0.5 block text-[13px] text-ink-2">
                  <span className="font-semibold text-warning">{summary.warrantyExpiring} unit</span> berakhir dalam{" "}
                  {WARRANTY_ALERT_DAYS} hari
                </span>
                <span
                  className={cn(
                    "mt-1.5 block text-[13px] font-medium text-accent underline-offset-4 group-hover:underline",
                    filter === "expiring" && "underline"
                  )}
                >
                  {filter === "expiring" ? "Tampilkan semua kontrak" : "Tampilkan unit terdampak"}
                </span>
              </span>
            </button>
            <dl className="mt-4 space-y-2 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-muted">Garansi sudah berakhir</dt>
                <dd className="tabular text-ink-2">{summary.warrantyExpired} unit</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Jatuh tempo ≤ 90 hari</dt>
                <dd className="tabular text-ink-2">{summary.dueWithin90Days} unit</dd>
              </div>
            </dl>
          </div>
        </div>
        <div ref={tableRef} className="min-w-0 scroll-mt-24">
          <ContractWorkspace
            contracts={contracts}
            sensors={sensors}
            filter={filter}
            onFilterChange={setFilter}
            pageSize={7}
          />
        </div>
      </div>
    </Panel>
  );
}
