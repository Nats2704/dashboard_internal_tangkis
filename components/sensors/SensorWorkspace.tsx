"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { Sensor, SensorStatus } from "@/types/sensor";
import { Tabs } from "@/components/ui/Tabs";
import { sensorSeverityRank } from "@/lib/analytics/sensors";
import { SensorTable } from "./SensorTable";
import { SensorDetailDrawer } from "./SensorDetailDrawer";

export type SensorFilter = "all" | SensorStatus;

const FILTERS: { value: SensorFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "normal", label: "Normal" },
  { value: "stuck", label: "Macet" },
  { value: "out_of_range", label: "Out of Range" },
  { value: "calibration", label: "Calibration" },
  { value: "no_data", label: "Tanpa data" },
];

interface SensorWorkspaceProps {
  sensors: Sensor[];
  pageSize: number;
  initialFilter?: SensorFilter;
  initialSensorId?: string | null;
  query?: string;
  toolbar?: ReactNode;
}

/** Tabel sensor dengan filter status dan drawer detail. Dipakai di dashboard dan halaman Sensor. */
export function SensorWorkspace({
  sensors,
  pageSize,
  initialFilter = "all",
  initialSensorId = null,
  query = "",
  toolbar,
}: SensorWorkspaceProps) {
  const [filter, setFilter] = useState<SensorFilter>(initialFilter);
  const [selectedId, setSelectedId] = useState<string | null>(initialSensorId);

  const counts = useMemo(() => {
    const map: Record<SensorFilter, number> = { all: sensors.length, normal: 0, stuck: 0, out_of_range: 0, calibration: 0, no_data: 0 };
    for (const s of sensors) map[s.status] += 1;
    return map;
  }, [sensors]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sensors
      .filter((s) => filter === "all" || s.status === filter)
      .filter((s) => !q || s.id.toLowerCase().includes(q))
      .sort(
        (a, b) =>
          sensorSeverityRank(a) - sensorSeverityRank(b) ||
          Math.abs(b.deviationPct ?? 0) - Math.abs(a.deviationPct ?? 0)
      );
  }, [sensors, filter, query]);

  const selected = selectedId ? sensors.find((s) => s.id === selectedId) ?? null : null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4 pb-3">
        <Tabs
          label="Filter status sensor"
          value={filter}
          onChange={setFilter}
          items={FILTERS.map((f) => ({ ...f, count: counts[f.value] }))}
        />
        {toolbar}
      </div>
      <div className="border-t border-line">
        <SensorTable
          key={`${filter}-${query}`}
          sensors={rows}
          onSelect={(s) => setSelectedId(s.id)}
          selectedId={selectedId}
          pageSize={pageSize}
        />
      </div>
      <SensorDetailDrawer sensor={selected} onClose={() => setSelectedId(null)} />
    </div>
  );
}
