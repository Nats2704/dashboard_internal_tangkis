"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Sensor, SensorTrendPoint } from "@/types/sensor";
import { Panel, SectionHeader } from "@/components/ui/Panel";
import { SearchInput } from "@/components/ui/SearchInput";
import { SensorSummaryStrip } from "@/components/dashboard/SensorHealth";
import { SensorTrendChart } from "./SensorTrendChart";
import { SensorKindBreakdown } from "./SensorKindBreakdown";
import { SensorWorkspace, type SensorFilter } from "./SensorWorkspace";

const VALID: SensorFilter[] = ["all", "normal", "stuck", "out_of_range", "calibration", "no_data"];

export function SensorsView({ sensors, trend }: { sensors: Sensor[]; trend: SensorTrendPoint[] }) {
  const params = useSearchParams();
  const [query, setQuery] = useState("");
  const status = params.get("status") as SensorFilter | null;

  return (
    <div className="space-y-4 lg:space-y-5">
      <Panel labelledBy="ringkasan-sensor">
        <SectionHeader id="ringkasan-sensor" title="Ringkasan sensor" description="Tiga sensor per unit terpasang: level BBM, kadar air, dan suhu tangki." />
        <SensorSummaryStrip sensors={sensors} />
        <div className="grid xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 border-b border-line px-5 py-5 xl:border-r xl:border-b-0">
            <SensorTrendChart data={trend} />
          </div>
          <div className="px-5 py-5">
            <SensorKindBreakdown sensors={sensors} />
          </div>
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
