"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { SensorTrendPoint } from "@/types/sensor";
import { ArrowUpRight } from "lucide-react";
import { useFleet } from "@/components/providers/FleetProvider";
import { signalDistribution, summarizeFleet } from "@/lib/analytics/devices";
import { summarizeInventory } from "@/lib/analytics/inventory";
import { LOW_BATTERY_PCT, WEAK_SIGNAL_DBM } from "@/lib/constants";
import { formatNumber, formatPercent } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { CountUp } from "@/components/ui/CountUp";
import { Sparkline } from "@/components/ui/Sparkline";
import { SegmentBar } from "@/components/ui/Meter";
import { FirmwareUpdateModal } from "@/components/devices/FirmwareUpdateModal";

function KpiCard({
  label,
  children,
  footer,
  accent,
  className,
}: {
  label: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Garis tipis di atas kartu, hanya untuk metrik yang sedang bermasalah. */
  accent?: "danger" | "warning";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-line bg-surface px-4 pt-3.5 pb-4 transition-[border-color,transform,background-color] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:bg-surface-hover",
        className
      )}
    >
      {accent ? (
        <span
          aria-hidden
          className={cn(
            "absolute inset-x-0 top-0 h-px",
            accent === "danger"
              ? "bg-gradient-to-r from-danger/80 via-danger/30 to-transparent"
              : "bg-gradient-to-r from-warning/80 via-warning/30 to-transparent"
          )}
        />
      ) : null}
      <p className="text-[12px] text-muted">{label}</p>
      <div className="mt-1.5 flex-1">{children}</div>
      {footer ? <div className="mt-2 text-[11.5px] leading-snug text-muted">{footer}</div> : null}
    </div>
  );
}

function BigValue({ children, unit, tone }: { children: ReactNode; unit?: string; tone?: "danger" }) {
  return (
    <p
      className={cn(
        "text-[30px] leading-9 font-semibold tracking-[-0.035em]",
        tone === "danger" ? "text-danger" : "text-ink"
      )}
    >
      {children}
      {unit ? <span className="ml-1 text-[13px] font-medium tracking-normal text-muted">{unit}</span> : null}
    </p>
  );
}

/**
 * KPI armada. Ukuran kartu mengikuti bobot informasi: kartu armada paling lebar.
 * "band" satu baris (halaman Unit), "grid" dua baris di samping kartu kesehatan
 * (Beranda), dengan kartu tambahan kualitas sensor bila tren tersedia.
 */
export function HeroSummary({
  layout = "band",
  sensorTrend,
  className,
}: {
  layout?: "band" | "grid";
  sensorTrend?: SensorTrendPoint[];
  className?: string;
}) {
  const { devices } = useFleet();
  const [firmwareOpen, setFirmwareOpen] = useState(false);
  const fleet = useMemo(() => summarizeFleet(devices), [devices]);
  const stock = useMemo(() => summarizeInventory(devices), [devices]);
  const signal = useMemo(() => signalDistribution(devices), [devices]);
  const onlinePct = (fleet.online / Math.max(1, fleet.installed)) * 100;
  const signalMax = Math.max(...signal.map((s) => s.count), 1);

  const lifecycle = [
    { key: "online", label: "Online", value: fleet.online, className: "bg-success" },
    { key: "maintenance", label: "Maintenance", value: fleet.maintenance, className: "bg-warning" },
    { key: "offline", label: "Offline", value: fleet.offline, className: "bg-danger" },
    { key: "repair", label: "Perbaikan", value: stock.byStage.repair, className: "bg-ink-2/40" },
    { key: "returned", label: "Ditarik", value: stock.byStage.returned, className: "bg-info/60" },
    { key: "warehouse", label: "Gudang", value: stock.byStage.warehouse, className: "bg-line-strong" },
  ];

  return (
    <section
      aria-label="Ringkasan armada"
      className={cn(
        "grid gap-3",
        layout === "band"
          ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-[minmax(0,1.9fr)_repeat(5,minmax(0,1fr))]"
          : "auto-rows-fr grid-cols-2 sm:grid-cols-4",
        className
      )}
    >
      <KpiCard label="Total unit" className={layout === "band" ? "col-span-2 md:col-span-3 xl:col-span-1" : "col-span-2"}>
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
          <BigValue unit="unit">
            <CountUp value={fleet.total} />
          </BigValue>
          <p className="pb-1 text-[12px] text-muted">
            <span className="tabular text-ink-2">{fleet.installed}</span> terpasang ·{" "}
            <span className="tabular text-ink-2">{fleet.total - fleet.installed}</span> gudang/perbaikan
          </p>
        </div>
        <SegmentBar className="mt-3" label="Sebaran unit berdasarkan status" segments={lifecycle} />
        <ul className="mt-2.5 flex flex-wrap gap-x-3.5 gap-y-1 text-[11.5px] text-muted">
          {lifecycle.map((item) => (
            <li key={item.key} className="inline-flex items-center gap-1.5">
              <span className={cn("size-1.5 rounded-full", item.className)} aria-hidden />
              {item.label} <span className="tabular text-ink-2">{item.value}</span>
            </li>
          ))}
        </ul>
      </KpiCard>

      <KpiCard
        label="Online"
        footer={`${formatPercent(onlinePct)} dari unit terpasang`}
      >
        <BigValue>
          <CountUp value={fleet.online} />
        </BigValue>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]" aria-hidden>
          <div className="h-full rounded-full bg-success" style={{ width: `${onlinePct}%` }} />
        </div>
      </KpiCard>

      <KpiCard label="Offline" accent={fleet.offline ? "danger" : undefined} footer={`${fleet.offlineOver24h} unit lebih dari 24 jam`}>
        <BigValue tone={fleet.offline ? "danger" : undefined}>
          <CountUp value={fleet.offline} />
        </BigValue>
      </KpiCard>

      <KpiCard label="Rata-rata sinyal" footer={`${fleet.weakSignal} unit di bawah ${formatNumber(WEAK_SIGNAL_DBM)} dBm`}>
        <div className="flex items-end justify-between gap-3">
          <BigValue unit="dBm">{formatNumber(fleet.avgSignalDbm)}</BigValue>
          {/* Sebaran kekuatan sinyal: empat batang, dari sangat baik ke lemah. */}
          <div className="mb-1.5 flex h-7 items-end gap-[3px]" role="img" aria-label={signal.map((s) => `${s.label} ${s.count}`).join(", ")}>
            {[...signal].reverse().map((s, i) => (
              <span
                key={s.label}
                className={cn("w-[5px] rounded-[1px]", i === 0 ? "bg-danger/80" : "bg-ink-2/50")}
                style={{ height: `${Math.max(12, (s.count / signalMax) * 100)}%` }}
              />
            ))}
          </div>
        </div>
      </KpiCard>

      <KpiCard
        label="Baterai cadangan"
        accent={fleet.lowBattery ? "warning" : undefined}
        footer={`Rata-rata · ${fleet.lowBattery} unit di bawah ${LOW_BATTERY_PCT}%`}
      >
        <div className="flex items-end justify-between gap-3">
          <BigValue unit="%">
            <CountUp value={fleet.avgBatteryPct} />
          </BigValue>
          <span className="relative mb-2 h-3.5 w-7 rounded-[3px] border border-line-strong p-[2px]" aria-hidden>
            <span className="block h-full rounded-[1px] bg-ink-2/60" style={{ width: `${fleet.avgBatteryPct}%` }} />
            <span className="absolute top-1/2 -right-[3px] h-1.5 w-[2px] -translate-y-1/2 rounded-r-sm bg-line-strong" />
          </span>
        </div>
      </KpiCard>

      <KpiCard
        label="Firmware terbaru"
        accent={fleet.outdatedUpdatable ? "warning" : undefined}
        footer={
          fleet.outdatedUpdatable > 0 ? (
            <button
              type="button"
              onClick={() => setFirmwareOpen(true)}
              className="inline-flex items-center gap-1 rounded text-left font-medium text-warning hover:underline"
            >
              {fleet.outdatedUpdatable} unit perlu update
              <ArrowUpRight className="size-3 shrink-0" />
            </button>
          ) : (
            <span className="text-success">Semua unit online sudah terbaru</span>
          )
        }
      >
        <p className="font-mono text-[24px] leading-9 font-semibold tracking-[-0.02em] text-ink">{fleet.latestFirmware}</p>
      </KpiCard>

      {sensorTrend && sensorTrend.length > 1 ? (
        <KpiCard label="Sensor normal" footer="Tren 12 minggu">
          <BigValue unit="%">{formatNumber(sensorTrend[sensorTrend.length - 1].normalPct, 1)}</BigValue>
          <Sparkline
            data={sensorTrend.map((p) => p.normalPct)}
            color="var(--color-warning)"
            height={22}
            className="mt-1"
            label={`Sensor normal turun dari ${formatPercent(sensorTrend[0].normalPct)} ke ${formatPercent(sensorTrend[sensorTrend.length - 1].normalPct)} dalam 12 minggu`}
          />
        </KpiCard>
      ) : null}

      <FirmwareUpdateModal open={firmwareOpen} onClose={() => setFirmwareOpen(false)} />
    </section>
  );
}
