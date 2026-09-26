"use client";

import type { Sensor } from "@/types/sensor";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { SENSOR_KIND, SENSOR_STATUS } from "@/lib/constants/status";
import { sensorSeverityRank } from "@/lib/analytics/sensors";
import { CALIBRATION_THRESHOLD_PCT } from "@/lib/constants";
import { formatSignedPercent } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { useReferenceData } from "@/components/providers/ReferenceDataProvider";
import { formatReading } from "@/components/devices/DeviceDetailDrawer";

export function DeviationValue({ value }: { value: number | null }) {
  if (value === null) return <span className="text-subtle">—</span>;
  const over = Math.abs(value) > CALIBRATION_THRESHOLD_PCT;
  return <span className={cn("tabular", over && "font-medium text-warning")}>{formatSignedPercent(value)}</span>;
}

interface SensorTableProps {
  sensors: Sensor[];
  onSelect: (sensor: Sensor) => void;
  selectedId?: string | null;
  pageSize?: number;
}

export function SensorTable({ sensors, onSelect, selectedId, pageSize }: SensorTableProps) {
  const { buildingById } = useReferenceData();

  const columns: Column<Sensor>[] = [
    {
      key: "id",
      header: "Sensor",
      sortValue: (s) => s.id,
      cell: (s) => <span className="font-medium text-ink">{s.id}</span>,
    },
    {
      key: "kind",
      header: "Jenis",
      sortValue: (s) => SENSOR_KIND[s.kind].label,
      cell: (s) => SENSOR_KIND[s.kind].label,
    },
    {
      key: "building",
      header: "Gedung",
      hideBelow: "xl",
      sortValue: (s) => buildingById.get(s.buildingId)?.name ?? "",
      cell: (s) => <span className="text-muted">{buildingById.get(s.buildingId)?.name}</span>,
    },
    {
      key: "reading",
      header: "Pembacaan",
      align: "right",
      cell: (s) => (
        <span className={cn(s.status === "out_of_range" && "font-medium text-danger")}>
          {formatReading(s, s.currentReading)}
        </span>
      ),
    },
    {
      key: "lab",
      header: "Hasil lab",
      align: "right",
      hideBelow: "md",
      cell: (s) => <span className="text-muted">{formatReading(s, s.labResult)}</span>,
    },
    {
      key: "deviation",
      header: "Selisih",
      align: "right",
      sortValue: (s) => (s.deviationPct === null ? null : Math.abs(s.deviationPct)),
      cell: (s) => <DeviationValue value={s.deviationPct} />,
    },
    {
      key: "status",
      header: "Status",
      sortValue: (s) => sensorSeverityRank(s),
      cell: (s) => <Badge tone={SENSOR_STATUS[s.status].tone}>{SENSOR_STATUS[s.status].label}</Badge>,
    },
  ];

  return (
    <DataTable
      rows={sensors}
      columns={columns}
      getRowId={(s) => s.id}
      caption="Daftar sensor dan selisih terhadap hasil lab"
      onRowClick={onSelect}
      selectedId={selectedId}
      pageSize={pageSize}
    />
  );
}
