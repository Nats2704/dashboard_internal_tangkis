"use client";

import type { Device } from "@/types/device";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { CONNECTIVITY, LIFECYCLE } from "@/lib/constants/status";
import { connectivityRank, isOutdated } from "@/lib/analytics/devices";
import { formatRelative } from "@/lib/utils/format";
import { useReferenceData } from "@/components/providers/ReferenceDataProvider";
import { BatteryReading, SignalReading } from "./DeviceIndicators";

interface DeviceTableProps {
  devices: Device[];
  onSelect: (device: Device) => void;
  selectedId?: string | null;
  pageSize?: number;
  highlightIds?: Set<string>;
  showBuilding?: boolean;
}

export function DeviceTable({
  devices,
  onSelect,
  selectedId,
  pageSize,
  highlightIds,
  showBuilding = true,
}: DeviceTableProps) {
  const { buildingById } = useReferenceData();

  const columns: Column<Device>[] = [
    {
      key: "unit",
      header: "Unit",
      sortValue: (d) => d.id,
      cell: (d) => <span className="font-medium text-ink">{d.id}</span>,
    },
    ...(showBuilding
      ? [
          {
            key: "building",
            header: "Gedung",
            hideBelow: "lg" as const,
            sortValue: (d: Device) => (d.buildingId ? buildingById.get(d.buildingId)?.name ?? "" : ""),
            cell: (d: Device) => (
              <span className="text-muted">
                {d.buildingId ? buildingById.get(d.buildingId)?.name : "Gudang"}
              </span>
            ),
          },
        ]
      : []),
    {
      key: "status",
      header: "Status",
      sortValue: (d) => connectivityRank(d),
      cell: (d) =>
        d.connectivity ? (
          <Badge tone={CONNECTIVITY[d.connectivity].tone}>{CONNECTIVITY[d.connectivity].label}</Badge>
        ) : (
          <Badge tone={LIFECYCLE[d.lifecycle].tone}>{LIFECYCLE[d.lifecycle].label}</Badge>
        ),
    },
    {
      key: "lastSeen",
      header: "Last Data",
      sortValue: (d) => (d.lastSeen ? -Date.parse(d.lastSeen) : null),
      cell: (d) => <span className="tabular">{formatRelative(d.lastSeen)}</span>,
    },
    {
      key: "signal",
      header: "Signal",
      sortValue: (d) => d.signalDbm,
      cell: (d) => <SignalReading dbm={d.signalDbm} />,
    },
    {
      key: "battery",
      header: "Battery",
      sortValue: (d) => d.batteryPct,
      cell: (d) => <BatteryReading pct={d.batteryPct} />,
    },
    {
      key: "firmware",
      header: "Firmware",
      sortValue: (d) => d.firmware,
      cell: (d) =>
        isOutdated(d) ? (
          <span className="tabular inline-flex items-center gap-1.5 text-warning">
            {d.firmware}
            <span className="rounded bg-warning-soft px-1 text-[10.5px] font-medium">lama</span>
          </span>
        ) : (
          <span className="tabular">{d.firmware}</span>
        ),
    },
  ];

  return (
    <DataTable
      rows={devices}
      columns={columns}
      getRowId={(d) => d.id}
      caption="Daftar unit TANGKIS"
      onRowClick={onSelect}
      selectedId={selectedId}
      pageSize={pageSize}
      highlightIds={highlightIds}
    />
  );
}
