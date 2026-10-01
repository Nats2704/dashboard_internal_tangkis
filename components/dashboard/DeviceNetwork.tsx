"use client";

import { useMemo, type ReactNode } from "react";
import { Activity, Cloud, Cpu, MonitorDot, RadioTower, type LucideIcon } from "lucide-react";
import type { Sensor } from "@/types/sensor";
import { useFleet } from "@/components/providers/FleetProvider";
import { summarizeFleet } from "@/lib/analytics/devices";
import { summarizeSensors } from "@/lib/analytics/sensors";
import { signalLevel } from "@/components/devices/DeviceIndicators";
import { DATA_SNAPSHOT_AT, OFFLINE_THRESHOLD_HOURS, REPORT_INTERVAL_MINUTES } from "@/lib/constants";
import { formatDate, formatNumber, formatTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Panel, SectionHeader } from "@/components/ui/Panel";
import { PulseDot } from "@/components/ui/PulseDot";

const SIGNAL_LABEL = ["", "Lemah", "Cukup", "Baik", "Sangat baik"];

function Node({
  icon: Icon,
  title,
  value,
  sub,
  tone = "success",
}: {
  icon: LucideIcon;
  title: string;
  value: ReactNode;
  sub: ReactNode;
  tone?: "success" | "warning" | "danger";
}) {
  return (
    <div className="relative z-[1] flex min-w-0 items-center gap-3 rounded-lg border border-line bg-sunken/80 px-3.5 py-3 xl:flex-1 xl:flex-col xl:items-start xl:gap-2.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-line-strong bg-surface text-ink-2">
        <Icon className="size-[18px]" strokeWidth={1.6} />
      </span>
      <div className="w-full min-w-0">
        <p className="flex items-center gap-1.5 text-[11.5px] text-muted">
          <PulseDot tone={tone} pulse={false} />
          {title}
        </p>
        <p className="tabular truncate text-[15px] leading-6 font-semibold tracking-[-0.01em] text-ink">{value}</p>
        <p className="truncate text-[11px] text-subtle">{sub}</p>
      </div>
    </div>
  );
}

/** Garis penghubung dengan aliran data yang bergerak pelan; label opsional di tengah. */
function Link_({ label, tone = "accent" }: { label?: string; tone?: "accent" | "danger" }) {
  const stroke = tone === "danger" ? "var(--color-danger)" : "var(--color-accent)";
  return (
    <div className="relative flex h-8 items-center xl:h-10 xl:w-[84px] xl:shrink-0 xl:justify-center 2xl:w-[104px]" aria-hidden>
      <svg className="absolute inset-0 hidden h-full w-full xl:block" preserveAspectRatio="none">
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="var(--color-line-strong)" strokeWidth="1" />
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke={stroke} strokeOpacity="0.8" strokeWidth="1.5" strokeDasharray="3 13" className="animate-dash-flow" />
      </svg>
      <svg className="absolute inset-0 h-full w-full xl:hidden" preserveAspectRatio="none">
        <line x1="24" y1="0" x2="24" y2="100%" stroke="var(--color-line-strong)" strokeWidth="1" />
        <line x1="24" y1="0" x2="24" y2="100%" stroke={stroke} strokeOpacity="0.8" strokeWidth="1.5" strokeDasharray="3 13" className="animate-dash-flow" />
      </svg>
      {label ? (
        <span
          className={cn(
            "relative ml-14 text-[10.5px] leading-4 whitespace-nowrap xl:absolute xl:top-[calc(50%+5px)] xl:left-1/2 xl:ml-0 xl:-translate-x-1/2",
            tone === "danger" ? "text-danger" : "text-muted"
          )}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Jalur data dari probe di tangki sampai dashboard. Setiap simpul membawa
 * angka nyata dari armada, dan penghubung menandai di mana data terputus.
 */
export function DeviceNetwork({ sensors }: { sensors: Sensor[] }) {
  const { devices } = useFleet();
  const fleet = useMemo(() => summarizeFleet(devices), [devices]);
  const sensorSummary = useMemo(() => summarizeSensors(sensors), [sensors]);
  const reporting = fleet.online + fleet.maintenance;
  const level = signalLevel(fleet.avgSignalDbm);
  const latestPct = ((fleet.installed - fleet.outdatedFirmware) / Math.max(1, fleet.installed)) * 100;

  return (
    <Panel labelledBy="jaringan-title">
      <SectionHeader
        id="jaringan-title"
        eyebrow="Jaringan IoT"
        title="Jalur data perangkat"
        description="Dari probe di tangki, lewat unit TANGKIS dan jaringan seluler, sampai ke dashboard ini."
      />
      <div className="flex flex-col px-5 pb-5 xl:flex-row xl:items-center">
        <Node
          icon={Activity}
          title="Sensor tangki"
          value={
            <>
              {formatNumber(sensorSummary.evaluated)}
              <span className="ml-1 text-[12px] font-medium text-muted">/ {formatNumber(sensorSummary.total)}</span>
            </>
          }
          sub="Level, kadar air, suhu"
          tone={sensorSummary.stuck + sensorSummary.outOfRange > 0 ? "warning" : "success"}
        />
        <Link_ label={`${sensorSummary.noData} tanpa data`} tone={sensorSummary.noData ? "danger" : "accent"} />
        <Node
          icon={Cpu}
          title="Unit TANGKIS"
          value={
            <>
              {reporting}
              <span className="ml-1 text-[12px] font-medium text-muted">/ {fleet.installed}</span>
            </>
          }
          sub={`Melapor · ${formatNumber(latestPct, 0)}% firmware ${fleet.latestFirmware}`}
          tone={fleet.offline ? "warning" : "success"}
        />
        <Link_ label={`${fleet.offline} terputus`} tone={fleet.offline ? "danger" : "accent"} />
        <Node
          icon={RadioTower}
          title="Jaringan seluler"
          value={
            <>
              {formatNumber(fleet.avgSignalDbm)}
              <span className="ml-1 text-[12px] font-medium text-muted">dBm</span>
            </>
          }
          sub={`${SIGNAL_LABEL[level]} · ${fleet.weakSignal} unit lemah`}
          tone={level <= 1 ? "warning" : "success"}
        />
        <Link_ />
        <Node
          icon={Cloud}
          title="Cloud TANGKIS"
          value={`${REPORT_INTERVAL_MINUTES} menit`}
          sub={`Interval kirim · offline > ${OFFLINE_THRESHOLD_HOURS} jam`}
        />
        <Link_ />
        <Node
          icon={MonitorDot}
          title="Dashboard"
          value={`${formatTime(DATA_SNAPSHOT_AT)} WIB`}
          sub={`Snapshot ${formatDate(DATA_SNAPSHOT_AT)}`}
        />
      </div>
    </Panel>
  );
}
