"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, BatteryMedium, Cpu, Clock3, Wrench } from "lucide-react";
import type { AppNotification } from "@/types/notification";
import { useFleet } from "@/components/providers/FleetProvider";
import { useReferenceData } from "@/components/providers/ReferenceDataProvider";
import { useTickets } from "@/components/providers/TicketProvider";
import { buttonClasses } from "@/components/ui/Button";
import { PulseDot } from "@/components/ui/PulseDot";
import { isOutdated } from "@/lib/analytics/devices";
import { LOW_BATTERY_PCT } from "@/lib/constants";
import { formatRelative, formatTime, hoursSince } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { ReportingStrip } from "./ReportingStrip";

const SEVERITY = {
  critical: { label: "Kritis", text: "text-danger", border: "border-danger/30", bar: "bg-danger", tone: "danger" as const },
  warning: { label: "Perhatian", text: "text-warning", border: "border-warning/25", bar: "bg-warning", tone: "warning" as const },
  info: { label: "Info", text: "text-info", border: "border-line", bar: "bg-info", tone: "info" as const },
};

function Telemetry({
  icon: Icon,
  label,
  value,
  unit,
  hint,
  tone,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  tone?: "danger" | "warning";
}) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1.5 text-[11.5px] text-muted">
        <Icon className="size-3.5 text-subtle" strokeWidth={1.75} />
        {label}
      </p>
      <p
        className={cn(
          "tabular mt-1 text-[22px] leading-7 font-semibold tracking-[-0.025em]",
          tone === "danger" ? "text-danger" : tone === "warning" ? "text-warning" : "text-ink"
        )}
      >
        {value}
        {unit ? <span className="ml-1 text-[12px] font-medium tracking-normal text-muted">{unit}</span> : null}
      </p>
      {hint ? <p className="mt-0.5 truncate text-[11.5px] text-muted">{hint}</p> : null}
    </div>
  );
}

/**
 * Kartu insiden: alarm paling penting ditampilkan lebar dengan telemetri unit
 * terkait, jendela laporan, dan tindakan berikutnya.
 */
export function IncidentCard({
  notification,
  className,
  children,
}: {
  notification: AppNotification;
  className?: string;
  /** Rincian tambahan untuk alarm yang tidak menyangkut satu unit. */
  children?: ReactNode;
}) {
  const { deviceById } = useFleet();
  const { buildingById, technicianById } = useReferenceData();
  const { ticketsByDevice } = useTickets();
  const sev = SEVERITY[notification.severity];

  const device = notification.deviceId ? deviceById.get(notification.deviceId) : undefined;
  const building = device?.buildingId ? buildingById.get(device.buildingId) : undefined;
  const ticket = device
    ? (ticketsByDevice.get(device.id) ?? []).find((t) => t.status !== "completed")
    : undefined;
  const technician = ticket?.technicianId ? technicianById.get(ticket.technicianId) : undefined;
  const offlineHours = device?.lastSeen ? hoursSince(device.lastSeen) : null;

  return (
    <article
      className={cn(
        "@container relative overflow-hidden rounded-lg border bg-surface",
        sev.border,
        className
      )}
      aria-labelledby={`${notification.id}-title`}
    >
      <span className={cn("absolute inset-y-0 left-0 w-[3px]", sev.bar)} aria-hidden />
      {notification.severity === "critical" ? (
        <span
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-danger/[0.07] blur-3xl"
        />
      ) : null}

      <div className="relative px-5 pt-4 pb-5 sm:pl-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className={cn("inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.1em] uppercase", sev.text)}>
            <PulseDot tone={sev.tone} pulse={notification.severity === "critical"} />
            {sev.label}
          </span>
          <span className="text-[11.5px] text-subtle">Alarm {formatRelative(notification.createdAt)}</span>
        </div>

        <h3 id={`${notification.id}-title`} className="mt-2 text-[19px] leading-snug font-semibold tracking-[-0.015em] text-ink sm:text-[21px]">
          {notification.title}
        </h3>
        {building ? (
          <p className="mt-1 text-[13px] text-muted">
            <span className="text-ink-2">{building.name}</span> · {building.area}, {building.city}
            {device?.tankLabel ? <> · {device.tankLabel}</> : null}
          </p>
        ) : null}

        {device ? (
          <>
            <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 @xl:grid-cols-4">
              <Telemetry
                icon={Clock3}
                label="Data terakhir"
                value={offlineHours !== null ? `${Math.floor(offlineHours)}` : "—"}
                unit="jam lalu"
                hint={device.lastSeen ? `pukul ${formatTime(device.lastSeen)} WIB` : undefined}
                tone="danger"
              />
              <Telemetry
                icon={BatteryMedium}
                label="Baterai cadangan"
                value={device.batteryPct !== null ? `${device.batteryPct}` : "—"}
                unit="%"
                hint={
                  device.batteryPct === null
                    ? undefined
                    : device.batteryPct < LOW_BATTERY_PCT
                      ? `Di bawah ambang ${LOW_BATTERY_PCT}%`
                      : `Di atas ambang ${LOW_BATTERY_PCT}%`
                }
                tone={device.batteryPct !== null && device.batteryPct < LOW_BATTERY_PCT ? "warning" : undefined}
              />
              <Telemetry
                icon={Cpu}
                label="Firmware"
                value={device.firmware}
                hint={isOutdated(device) ? "Versi lama, update saat online" : "Terbaru"}
                tone={isOutdated(device) ? "warning" : undefined}
              />
              <Telemetry
                icon={Wrench}
                label="Penanganan"
                value={ticket ? (technician ? "Ditugaskan" : "Belum ada") : "Tanpa tiket"}
                hint={ticket ? `${ticket.id}${technician ? ` · ${technician.name}` : " · teknisi belum ditunjuk"}` : undefined}
                tone={ticket && !technician ? "danger" : undefined}
              />
            </div>
            <ReportingStrip lastSeen={device.lastSeen} className="mt-5" />
          </>
        ) : (
          <>
            <p className="mt-1.5 max-w-[60ch] text-[13px] text-muted">{notification.description}</p>
            {children ? <div className="mt-4">{children}</div> : null}
          </>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Link href={notification.href} className={buttonClasses("primary", "sm")}>
            Lihat insiden
            <ArrowRight className="size-3.5" />
          </Link>
          {ticket && !technician ? (
            <Link href={`/service?ticket=${ticket.id}`} className={buttonClasses("secondary", "sm")}>
              Tugaskan teknisi
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
