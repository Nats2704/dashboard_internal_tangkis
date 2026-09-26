"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Device } from "@/types/device";
import type { Sensor } from "@/types/sensor";
import type { Contract } from "@/types/contract";
import { Drawer } from "@/components/ui/Drawer";
import { Badge } from "@/components/ui/Badge";
import { DetailList, DrawerSection } from "@/components/ui/DetailList";
import { useReferenceData } from "@/components/providers/ReferenceDataProvider";
import { useTickets } from "@/components/providers/TicketProvider";
import {
  CONNECTIVITY,
  LIFECYCLE,
  OWNERSHIP,
  SENSOR_KIND,
  SENSOR_STATUS,
  TICKET_CAUSE,
  TICKET_STATUS,
  WARRANTY,
} from "@/lib/constants/status";
import { isOutdated } from "@/lib/analytics/devices";
import { warrantyState } from "@/lib/analytics/contracts";
import { LATEST_FIRMWARE } from "@/lib/constants";
import {
  formatDate,
  formatDateTime,
  formatDaysLeft,
  formatNumber,
  formatRelative,
} from "@/lib/utils/format";
import { BatteryReading, SignalReading } from "./DeviceIndicators";

interface DeviceDetailDrawerProps {
  device: Device | null;
  onClose: () => void;
  sensors?: Sensor[];
  contract?: Contract;
}

export function formatReading(sensor: Sensor, value: number | null): string {
  if (value === null) return "—";
  const kind = SENSOR_KIND[sensor.kind];
  return `${formatNumber(value, kind.decimals)} ${kind.unit}`;
}

export function DeviceDetailDrawer({ device, onClose, sensors, contract }: DeviceDetailDrawerProps) {
  const { buildingById, customerById } = useReferenceData();
  const { ticketsByDevice } = useTickets();

  if (!device) return null;

  const building = device.buildingId ? buildingById.get(device.buildingId) : undefined;
  const status = device.connectivity
    ? CONNECTIVITY[device.connectivity]
    : LIFECYCLE[device.lifecycle];
  const tickets = ticketsByDevice.get(device.id) ?? [];
  const warranty = contract ? warrantyState(contract) : null;

  return (
    <Drawer
      open
      onClose={onClose}
      title={device.id}
      subtitle={
        building ? `${building.name} · ${device.tankLabel ?? ""}` : "Belum terpasang di gedung"
      }
      headerExtra={
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={status.tone} variant="soft">
            {status.label}
          </Badge>
          {device.lastSeen ? (
            <span className="text-[13px] text-muted">
              Data terakhir {formatRelative(device.lastSeen)}
            </span>
          ) : null}
        </div>
      }
    >
      {device.maintenanceNote ? (
        <div className="border-b border-line bg-warning-soft/60 px-6 py-3 text-[13px] text-ink-2">
          <span className="font-medium text-warning">Maintenance: </span>
          {device.maintenanceNote}
        </div>
      ) : null}

      <DrawerSection title="Kondisi perangkat">
        <DetailList
          items={[
            { label: "Sinyal", value: <SignalReading dbm={device.signalDbm} /> },
            { label: "Baterai cadangan", value: <BatteryReading pct={device.batteryPct} /> },
            {
              label: "Firmware",
              value: isOutdated(device) ? (
                <span className="text-warning">
                  {device.firmware} <span className="text-muted">→ tersedia {LATEST_FIRMWARE}</span>
                </span>
              ) : (
                device.firmware
              ),
            },
            { label: "Last data", value: formatDateTime(device.lastSeen) },
            { label: "Nomor seri", value: device.serial, mono: true },
            { label: "Dipasang", value: formatDate(device.installedAt) },
          ]}
        />
      </DrawerSection>

      {sensors && sensors.length > 0 ? (
        <DrawerSection title="Pembacaan sensor">
          <ul className="divide-y divide-line rounded-md border border-line">
            {sensors.map((sensor) => (
              <li key={sensor.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                <div>
                  <p className="text-[13px] text-ink">{SENSOR_KIND[sensor.kind].label}</p>
                  <p className="text-[12px] text-muted">
                    Lab {formatReading(sensor, sensor.labResult)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="tabular text-[14px] font-medium text-ink">
                    {sensor.currentReading === null && sensor.lastReading !== null ? (
                      <span className="font-normal text-muted">terakhir {formatReading(sensor, sensor.lastReading)}</span>
                    ) : (
                      formatReading(sensor, sensor.currentReading)
                    )}
                  </p>
                  <Badge tone={SENSOR_STATUS[sensor.status].tone} className="text-[12px]">
                    {SENSOR_STATUS[sensor.status].label}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </DrawerSection>
      ) : null}

      {contract ? (
        <DrawerSection title="Kontrak">
          <DetailList
            items={[
              { label: "Pelanggan", value: customerById.get(contract.customerId)?.name ?? "—" },
              { label: "Kepemilikan", value: OWNERSHIP[contract.ownership].label },
              { label: "Mulai kontrak", value: formatDate(contract.startDate) },
              {
                label: "Garansi",
                value: (
                  <span>
                    {formatDate(contract.warrantyEnd)}{" "}
                    {warranty ? (
                      <Badge tone={WARRANTY[warranty].tone} className="ml-1 text-[12px]">
                        {WARRANTY[warranty].label}
                      </Badge>
                    ) : null}
                  </span>
                ),
              },
              {
                label: contract.ownership === "rental" ? "Akhir sewa" : "Perpanjangan langganan",
                value: `${formatDate(contract.dueDate)} · ${formatDaysLeft(contract.dueDate)}`,
              },
              { label: "No. kontrak", value: contract.id, mono: true },
            ]}
          />
        </DrawerSection>
      ) : null}

      <DrawerSection title={`Riwayat tiket (${tickets.length})`}>
        {tickets.length === 0 ? (
          <p className="text-[13px] text-muted">Belum ada tiket servis kuartal ini.</p>
        ) : (
          <ul className="space-y-2.5">
            {tickets.map((ticket) => (
              <li key={ticket.id}>
                <Link
                  href={`/service?ticket=${ticket.id}`}
                  className="group flex items-start justify-between gap-3 rounded-md border border-line px-3.5 py-2.5 hover:border-line-strong hover:bg-sunken"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-ink">
                      {ticket.id} · {TICKET_CAUSE[ticket.cause]}
                    </p>
                    <p className="truncate text-[13px] text-muted">{ticket.problem}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge tone={TICKET_STATUS[ticket.status].tone} className="text-[12px]">
                      {TICKET_STATUS[ticket.status].label}
                    </Badge>
                    <ArrowUpRight className="size-3.5 text-subtle group-hover:text-ink" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </DrawerSection>
    </Drawer>
  );
}
