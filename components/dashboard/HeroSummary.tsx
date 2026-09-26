"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useFleet } from "@/components/providers/FleetProvider";
import { summarizeFleet } from "@/lib/analytics/devices";
import { summarizeInventory } from "@/lib/analytics/inventory";
import { formatNumber, formatPercent } from "@/lib/utils/format";
import { Metric } from "@/components/ui/Metric";
import { SegmentBar } from "@/components/ui/Meter";
import { FirmwareUpdateModal } from "@/components/devices/FirmwareUpdateModal";

export function HeroSummary() {
  const { devices } = useFleet();
  const [firmwareOpen, setFirmwareOpen] = useState(false);
  const fleet = useMemo(() => summarizeFleet(devices), [devices]);
  const stock = useMemo(() => summarizeInventory(devices), [devices]);
  const onlinePct = (fleet.online / Math.max(1, fleet.installed)) * 100;

  return (
    <section aria-label="Ringkasan armada" className="rounded-lg border border-line bg-surface">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <Metric
          size="lg"
          className="border-b border-line px-5 py-5 xl:border-b-0"
          label="Total Unit"
          value={formatNumber(fleet.total)}
          hint={`${fleet.installed} terpasang · ${fleet.total - fleet.installed} di gudang/perbaikan`}
        />
        <Metric
          size="lg"
          className="border-b border-l border-line px-5 py-5 xl:border-b-0"
          label="Online"
          value={formatNumber(fleet.online)}
          hint={`${formatPercent(onlinePct)} dari unit terpasang`}
        />
        <Metric
          size="lg"
          tone="danger"
          className="border-b border-line px-5 py-5 md:border-l xl:border-b-0"
          label="Offline"
          value={formatNumber(fleet.offline)}
          hint={`${fleet.offlineOver24h} unit lebih dari 24 jam`}
        />
        <Metric
          size="lg"
          className="border-b border-l border-line px-5 py-5 md:border-l-0 md:border-b-0 xl:border-l"
          label="Rata-rata Sinyal"
          value={formatNumber(fleet.avgSignalDbm)}
          unit="dBm"
          hint={`${fleet.weakSignal} unit di bawah −90 dBm`}
        />
        <Metric
          size="lg"
          className="border-line px-5 py-5 md:border-l"
          label="Baterai Cadangan"
          value={`${fleet.avgBatteryPct}%`}
          hint={`Rata-rata · ${fleet.lowBattery} unit di bawah 40%`}
        />
        <div className="border-l border-line px-5 py-5">
          <p className="text-[12.5px] text-muted">Firmware Terbaru</p>
          <p className="mt-1 text-[28px] leading-8 font-semibold tracking-tight">{fleet.latestFirmware}</p>
          {fleet.outdatedUpdatable > 0 ? (
            <button
              type="button"
              onClick={() => setFirmwareOpen(true)}
              className="mt-1 inline-flex items-center gap-1 text-left text-[12px] font-medium text-warning hover:underline"
            >
              {fleet.outdatedUpdatable} unit perlu update
              <ArrowUpRight className="size-3 shrink-0" />
            </button>
          ) : (
            <p className="mt-1 text-[12px] text-success">Semua unit online sudah terbaru</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-line px-5 py-3.5 lg:flex-row lg:items-center lg:gap-6">
        <p className="shrink-0 text-[12px] font-medium text-muted">Sebaran {fleet.total} unit</p>
        <SegmentBar
          className="lg:flex-1"
          label="Sebaran unit berdasarkan status"
          segments={[
            { key: "online", label: "Online", value: fleet.online, className: "bg-success" },
            { key: "maintenance", label: "Maintenance", value: fleet.maintenance, className: "bg-warning" },
            { key: "offline", label: "Offline", value: fleet.offline, className: "bg-danger" },
            { key: "repair", label: "Dalam perbaikan", value: stock.byStage.repair, className: "bg-ink-2/45" },
            { key: "returned", label: "Ditarik kembali", value: stock.byStage.returned, className: "bg-info/60" },
            { key: "warehouse", label: "Di gudang", value: stock.byStage.warehouse, className: "bg-line-strong" },
          ]}
        />
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted">
          {[
            ["bg-success", "Online", fleet.online],
            ["bg-warning", "Maintenance", fleet.maintenance],
            ["bg-danger", "Offline", fleet.offline],
            ["bg-ink-2/45", "Perbaikan", stock.byStage.repair],
            ["bg-info/60", "Ditarik", stock.byStage.returned],
            ["bg-line-strong", "Gudang", stock.byStage.warehouse],
          ].map(([color, label, value]) => (
            <li key={label as string} className="inline-flex items-center gap-1.5">
              <span className={`size-2 rounded-sm ${color}`} aria-hidden />
              {label} <span className="tabular text-ink-2">{value}</span>
            </li>
          ))}
        </ul>
      </div>

      <FirmwareUpdateModal open={firmwareOpen} onClose={() => setFirmwareOpen(false)} />
    </section>
  );
}
