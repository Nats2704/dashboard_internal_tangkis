"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { ShieldAlert } from "lucide-react";
import type { Contract } from "@/types/contract";
import type { Sensor } from "@/types/sensor";
import { summarizeContracts } from "@/lib/analytics/contracts";
import { WARRANTY_ALERT_DAYS } from "@/lib/constants";
import { formatPercent } from "@/lib/utils/format";
import { Panel, SectionHeader, SubHeading } from "@/components/ui/Panel";
import { SegmentBar } from "@/components/ui/Meter";
import { buttonClasses } from "@/components/ui/Button";
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
        actions={
          <Link href="/contracts" className={buttonClasses("secondary", "sm")}>
            Lihat semua
          </Link>
        }
      />
      <div className="grid xl:grid-cols-[300px_minmax(0,1fr)]">
        <div className="divide-y divide-line border-b border-line xl:border-r xl:border-b-0">
          <div className="px-5 py-4">
            <SubHeading>Kepemilikan unit</SubHeading>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[12.5px] text-muted">Milik pelanggan</p>
                <p className="mt-1 text-[22px] leading-7 font-semibold tracking-tight">
                  {summary.owned} <span className="text-[13px] font-medium text-muted">unit</span>
                </p>
              </div>
              <div>
                <p className="text-[12.5px] text-muted">Sewa</p>
                <p className="mt-1 text-[22px] leading-7 font-semibold tracking-tight">
                  {summary.rental} <span className="text-[13px] font-medium text-muted">unit</span>
                </p>
              </div>
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
              className={cn(
                "group w-full rounded-md border px-3.5 py-3 text-left transition-colors",
                filter === "expiring"
                  ? "border-warning/50 bg-warning-soft"
                  : "border-warning/25 bg-warning-soft/50 hover:bg-warning-soft"
              )}
            >
              <span className="flex items-start gap-2.5">
                <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning" />
                <span>
                  <span className="block text-[13.5px] font-medium text-ink">Garansi hampir habis</span>
                  <span className="mt-0.5 block text-[12.5px] text-ink-2">
                    <span className="font-semibold text-warning">{summary.warrantyExpiring} unit</span> berakhir dalam{" "}
                    {WARRANTY_ALERT_DAYS} hari
                  </span>
                  <span className="mt-1.5 block text-[12px] font-medium text-accent group-hover:underline">
                    {filter === "expiring" ? "Tampilkan semua kontrak" : "Tampilkan unit terdampak"}
                  </span>
                </span>
              </span>
            </button>
            <dl className="mt-4 space-y-2 text-[12.5px]">
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
