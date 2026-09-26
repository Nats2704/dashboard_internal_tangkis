"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Sensor, SensorTrendPoint } from "@/types/sensor";
import { Panel, SectionHeader } from "@/components/ui/Panel";
import { SearchInput } from "@/components/ui/SearchInput";
import { SensorSummaryStrip } from "@/components/dashboard/SensorHealth";
import { SensorTrendChart } from "./SensorTrendChart";
import { SensorWorkspace, type SensorFilter } from "./SensorWorkspace";

const VALID: SensorFilter[] = ["all", "normal", "stuck", "out_of_range", "calibration", "no_data"];

export function SensorsView({ sensors, trend }: { sensors: Sensor[]; trend: SensorTrendPoint[] }) {
  const params = useSearchParams();
  const [query, setQuery] = useState("");
  const status = params.get("status") as SensorFilter | null;

  return (
    <div className="space-y-6">
      <Panel labelledBy="ringkasan-sensor">
        <SectionHeader id="ringkasan-sensor" title="Ringkasan sensor" description="Tiga sensor per unit terpasang: level BBM, kadar air, dan suhu tangki." />
        <SensorSummaryStrip sensors={sensors} />
        <div className="px-5 py-5 lg:max-w-3xl">
          <SensorTrendChart data={trend} />
        </div>
      </Panel>
      <Panel labelledBy="daftar-sensor">
        <SectionHeader id="daftar-sensor" title="Daftar sensor" description="Anomali tampil lebih dulu. Klik baris untuk detail pembacaan dan kalibrasi." />
        <SensorWorkspace
          key={params.toString()}
          sensors={sensors}
          pageSize={15}
          initialFilter={status && VALID.includes(status) ? status : "all"}
          initialSensorId={params.get("sensor")}
          query={query}
          toolbar={<SearchInput value={query} onChange={setQuery} placeholder="Cari ID sensor atau unit" label="Cari sensor" />}
        />
      </Panel>
    </div>
  );
}
