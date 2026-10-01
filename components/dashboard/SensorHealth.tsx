import type { Sensor, SensorTrendPoint } from "@/types/sensor";
import { summarizeSensors } from "@/lib/analytics/sensors";
import { formatNumber, formatPercent } from "@/lib/utils/format";
import { Panel, SectionHeader } from "@/components/ui/Panel";
import { Metric } from "@/components/ui/Metric";
import { SensorTrendChart } from "@/components/sensors/SensorTrendChart";
import { SensorWorkspace } from "@/components/sensors/SensorWorkspace";

export function SensorSummaryStrip({ sensors }: { sensors: Sensor[] }) {
  const summary = summarizeSensors(sensors);
  return (
    <div className="grid grid-cols-2 border-b border-line md:grid-cols-3 xl:grid-cols-6 [&>*]:border-line [&>*]:px-5 [&>*]:py-4">
      <Metric
        label="Sensor Normal"
        value={formatPercent(summary.normalPct)}
        hint={`${formatNumber(summary.normal)} dari ${formatNumber(summary.evaluated)} sensor aktif`}
      />
      <Metric
        className="border-l"
        label="Pembacaan macet"
        value={summary.stuck}
        unit="sensor"
        tone={summary.stuck ? "danger" : undefined}
        hint="Tidak berubah > 24 jam"
      />
      <Metric
        className="border-t md:border-t-0 md:border-l"
        label="Di luar rentang wajar"
        value={summary.outOfRange}
        unit="sensor"
        tone={summary.outOfRange ? "danger" : undefined}
        hint="Nilai tidak mungkin secara fisik"
      />
      <Metric
        className="border-t border-l md:border-l-0 xl:border-t-0 xl:border-l"
        label="Perlu kalibrasi"
        value={summary.calibration}
        unit="sensor"
        tone={summary.calibration ? "warning" : undefined}
        hint={`Tersebar di ${summary.unitsNeedingCalibration} unit`}
      />
      <Metric
        className="border-t md:border-l xl:border-t-0"
        label="Selisih vs Lab Terakhir"
        value={formatPercent(summary.avgDeviationPct)}
        hint="Rata-rata absolut, di luar sensor out of range"
      />
      <Metric
        className="border-t border-l xl:border-t-0"
        label="Tanpa data"
        value={summary.noData}
        unit="sensor"
        hint="Unit induk sedang offline"
      />
    </div>
  );
}

export function SensorHealth({ sensors, trend }: { sensors: Sensor[]; trend: SensorTrendPoint[] }) {
  return (
    <Panel id="kesehatan-sensor" labelledBy="kesehatan-sensor-title">
      <SectionHeader
        id="kesehatan-sensor-title"
        eyebrow="Kualitas data"
        title="Kesehatan sensor"
        description="Level BBM, kadar air, dan suhu tangki dibandingkan dengan sampel lab terakhir."
        href="/sensors"
        linkLabel="Lihat semua sensor"
      />
      <SensorSummaryStrip sensors={sensors} />
      <div className="grid xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="border-b border-line px-5 py-4 xl:border-r xl:border-b-0">
          <SensorTrendChart data={trend} />
        </div>
        <div className="min-w-0">
          <SensorWorkspace sensors={sensors} pageSize={7} />
        </div>
      </div>
    </Panel>
  );
}
