"use client";

import { useMemo } from "react";
import type { Sensor } from "@/types/sensor";
import { useFleet } from "@/components/providers/FleetProvider";
import { summarizeHealth } from "@/lib/analytics/health";
import { formatNumber, formatPercent } from "@/lib/utils/format";
import { HealthRing } from "@/components/ui/HealthRing";
import { CountUp } from "@/components/ui/CountUp";
import { StatusDot } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { cn } from "@/lib/utils/cn";

/**
 * Kartu hero "Kesehatan armada": berapa porsi unit terpasang yang sehat,
 * berapa yang perlu perhatian, dan berapa yang kritis (offline).
 */
export function SystemHealth({ sensors, className }: { sensors: Sensor[]; className?: string }) {
  const { devices } = useFleet();
  const health = useMemo(() => summarizeHealth(devices, sensors), [devices, sensors]);
  const sites = useMemo(
    () => new Set(devices.filter((d) => d.lifecycle === "installed").map((d) => d.buildingId)).size,
    [devices]
  );

  const warningParts = [
    health.breakdown.maintenance ? `${health.breakdown.maintenance} maintenance` : null,
    health.breakdown.sensorIssue ? `${health.breakdown.sensorIssue} sensor bermasalah` : null,
    health.breakdown.lowBattery ? `${health.breakdown.lowBattery} baterai rendah` : null,
    health.breakdown.weakSignal ? `${health.breakdown.weakSignal} sinyal lemah` : null,
  ].filter(Boolean);

  const rows = [
    { key: "healthy", tone: "success" as const, label: "Sehat", value: health.healthy, hint: "Online, sensor normal" },
    { key: "warning", tone: "warning" as const, label: "Perhatian", value: health.warning, hint: warningParts.join(" · ") },
    { key: "critical", tone: "danger" as const, label: "Kritis", value: health.critical, hint: "Offline, data tangki berhenti" },
  ];

  return (
    <Panel labelledBy="kesehatan-title" className={cn("flex flex-col", className)}>
      <div className="px-5 pt-4">
        <p className="eyebrow">Status armada</p>
        <h2 id="kesehatan-title" className="mt-1 text-[15px] leading-6 font-semibold tracking-[-0.01em] text-ink">
          Kesehatan unit terpasang
        </h2>
      </div>

      <div className="flex flex-1 flex-col items-center gap-6 px-5 py-5 sm:flex-row sm:items-center 2xl:gap-8">
        <HealthRing
          label={`${formatPercent(health.healthPct)} unit sehat dari ${health.installed} unit terpasang`}
          segments={[
            { key: "healthy", label: "Sehat", value: health.healthy, tone: "success" },
            { key: "warning", label: "Perhatian", value: health.warning, tone: "warning" },
            { key: "critical", label: "Kritis", value: health.critical, tone: "danger" },
          ]}
        >
          <span className="text-[44px] leading-none font-semibold tracking-[-0.04em] text-ink">
            <CountUp value={health.healthPct} decimals={0} />
            <span className="ml-0.5 text-[20px] font-medium text-muted">%</span>
          </span>
          <span className="mt-1.5 text-[11.5px] text-muted">unit sehat</span>
        </HealthRing>

        <div className="w-full min-w-0 flex-1">
          <ul className="space-y-3.5">
            {rows.map((row) => (
              <li key={row.key} className="grid grid-cols-[auto_1fr_auto] items-start gap-x-2.5">
                <StatusDot tone={row.tone} className="mt-[7px] size-2" />
                <div className="min-w-0">
                  <p className="text-[13px] text-ink-2">{row.label}</p>
                  {row.hint ? <p className="text-[11.5px] leading-snug text-muted">{row.hint}</p> : null}
                </div>
                <p className="tabular text-[18px] leading-6 font-semibold tracking-[-0.02em] text-ink">{row.value}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <dl className="grid grid-cols-3 border-t border-line [&>div]:px-5 [&>div]:py-3">
        <div>
          <dt className="text-[11.5px] text-muted">Unit terpasang</dt>
          <dd className="tabular mt-0.5 text-[16px] font-semibold text-ink">
            {health.installed}
            <span className="ml-1 text-[11.5px] font-normal text-muted">/ {formatNumber(devices.length)}</span>
          </dd>
        </div>
        <div className="border-l border-line">
          <dt className="text-[11.5px] text-muted">Mengirim data</dt>
          <dd className="tabular mt-0.5 text-[16px] font-semibold text-ink">{formatPercent(health.reportingPct)}</dd>
        </div>
        <div className="border-l border-line">
          <dt className="text-[11.5px] text-muted">Gedung</dt>
          <dd className="tabular mt-0.5 text-[16px] font-semibold text-ink">{sites}</dd>
        </div>
      </dl>
    </Panel>
  );
}
