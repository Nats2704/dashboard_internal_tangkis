"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Droplets, Thermometer } from "lucide-react";
import type { Sensor, SensorKind } from "@/types/sensor";
import { useFleet } from "@/components/providers/FleetProvider";
import { useReferenceData } from "@/components/providers/ReferenceDataProvider";
import { summarizeFuel, tankReadings, type TankReading } from "@/lib/analytics/fuel";
import { SENSOR_KIND, SENSOR_STATUS } from "@/lib/constants/status";
import { formatDate, formatNumber } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Panel, SectionHeader, SubHeading } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { FuelTank } from "./FuelTank";

type Ranking = "water" | "low";

function Reading({
  kind,
  value,
  sensor,
  icon: Icon,
}: {
  kind: SensorKind;
  value: number | null;
  sensor: Sensor | undefined;
  icon?: typeof Droplets;
}) {
  const meta = SENSOR_KIND[kind];
  const status = sensor ? SENSOR_STATUS[sensor.status] : null;
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1.5 text-[11.5px] text-muted">
        {Icon ? <Icon className="size-3.5 text-subtle" strokeWidth={1.75} /> : null}
        {meta.label}
      </p>
      <p className="tabular mt-1 text-[26px] leading-8 font-semibold tracking-[-0.03em] text-ink">
        {value === null ? "—" : formatNumber(value, meta.decimals)}
        <span className="ml-1 text-[12px] font-medium tracking-normal text-muted">{meta.unit}</span>
      </p>
      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11.5px] text-muted">
        {sensor?.labResult !== null && sensor?.labResult !== undefined ? (
          <span className="tabular">
            Lab {formatNumber(sensor.labResult, meta.decimals)} {meta.unit}
          </span>
        ) : null}
        {status && sensor?.status !== "normal" ? (
          <Badge tone={status.tone} className="text-[11.5px]">
            {status.label}
          </Badge>
        ) : null}
      </p>
    </div>
  );
}

/**
 * Kondisi BBM dari sensor tangki: satu tangki dibuka rinci, sisanya
 * diringkas sebagai sebaran level dan peringkat yang bisa dipilih.
 */
export function FuelIntelligence({ sensors }: { sensors: Sensor[] }) {
  const { deviceById } = useFleet();
  const { buildingById } = useReferenceData();
  const tanks = useMemo(() => tankReadings(sensors), [sensors]);
  const summary = useMemo(() => summarizeFuel(tanks), [tanks]);
  const [ranking, setRanking] = useState<Ranking>("water");

  const byWater = useMemo(
    () => tanks.filter((t) => t.water !== null).sort((a, b) => (b.water ?? 0) - (a.water ?? 0)),
    [tanks]
  );
  const byLevel = useMemo(
    () => tanks.filter((t) => t.level !== null).sort((a, b) => (a.level ?? 0) - (b.level ?? 0)),
    [tanks]
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected: TankReading | undefined =
    (selectedId ? tanks.find((t) => t.deviceId === selectedId) : undefined) ?? byWater[0];

  const list = (ranking === "water" ? byWater : byLevel).slice(0, 6);
  const maxBin = Math.max(...summary.levelBins.map((b) => b.count), 1);
  const device = selected ? deviceById.get(selected.deviceId) : undefined;
  const building = selected ? buildingById.get(selected.buildingId) : undefined;

  return (
    <Panel id="bbm" labelledBy="bbm-title">
      <SectionHeader
        id="bbm-title"
        eyebrow="Fuel intelligence"
        title="Kondisi BBM per tangki"
        description="Level, kadar air, dan suhu dari sensor tangki di setiap unit. Pilih tangki di daftar untuk melihat rinciannya."
        href="/sensors"
        linkLabel="Semua sensor"
      />
      <div className="grid border-t border-line xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        {/* Tangki terpilih */}
        <div className="border-b border-line px-5 py-5 xl:border-r xl:border-b-0">
          {selected ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[15px] font-semibold text-ink">{selected.deviceId}</p>
                  <p className="truncate text-[12.5px] text-muted">
                    {building?.name}
                    {device?.tankLabel ? ` · ${device.tankLabel}` : ""}
                  </p>
                </div>
                <Link
                  href={`/devices?unit=${encodeURIComponent(selected.deviceId)}`}
                  className="group inline-flex items-center gap-1 rounded text-[12.5px] font-medium text-accent hover:text-accent-strong"
                >
                  Detail unit
                  <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
                </Link>
              </div>
              <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-center">
                <FuelTank
                  key={selected.deviceId}
                  level={selected.level}
                  label={`Level BBM ${selected.deviceId}: ${selected.level === null ? "tanpa data" : `${formatNumber(selected.level, 1)}%`}`}
                />
                <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-1 lg:grid-cols-2">
                  <Reading kind="level" value={selected.level} sensor={selected.sensors.level} />
                  <Reading kind="water" value={selected.water} sensor={selected.sensors.water} icon={Droplets} />
                  <Reading kind="temperature" value={selected.temperature} sensor={selected.sensors.temperature} icon={Thermometer} />
                  <div className="min-w-0">
                    <p className="text-[11.5px] text-muted">Kalibrasi terakhir</p>
                    <p className="tabular mt-1 text-[15px] font-medium text-ink-2">
                      {formatDate(selected.sensors.water?.lastCalibration ?? null)}
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-muted">
                      Sampel lab {formatDate(selected.sensors.water?.lastLabSample ?? null)}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-[13px] text-muted">Belum ada pembacaan tangki.</p>
          )}
        </div>

        {/* Ringkasan armada */}
        <div className="min-w-0">
          <dl className="grid grid-cols-2 border-b border-line sm:grid-cols-4 [&>div]:px-5 [&>div]:py-3.5">
            <div>
              <dt className="text-[11.5px] text-muted">Rata-rata level</dt>
              <dd className="tabular mt-0.5 text-[17px] font-semibold text-ink">
                {summary.avgLevel !== null ? `${formatNumber(summary.avgLevel, 1)}%` : "—"}
              </dd>
            </div>
            <div className="border-l border-line">
              <dt className="text-[11.5px] text-muted">Kadar air</dt>
              <dd className="tabular mt-0.5 text-[17px] font-semibold text-ink">
                {summary.avgWater !== null ? formatNumber(summary.avgWater, 0) : "—"}
                <span className="ml-1 text-[11.5px] font-medium text-muted">ppm</span>
              </dd>
            </div>
            <div className="border-t border-line sm:border-t-0 sm:border-l">
              <dt className="text-[11.5px] text-muted">Suhu tangki</dt>
              <dd className="tabular mt-0.5 text-[17px] font-semibold text-ink">
                {summary.avgTemperature !== null ? formatNumber(summary.avgTemperature, 1) : "—"}
                <span className="ml-1 text-[11.5px] font-medium text-muted">°C</span>
              </dd>
            </div>
            <div className="border-t border-l border-line sm:border-t-0">
              <dt className="text-[11.5px] text-muted">Tangki melapor</dt>
              <dd className="tabular mt-0.5 text-[17px] font-semibold text-ink">
                {summary.reporting}
                <span className="ml-1 text-[11.5px] font-medium text-muted">/ {summary.total}</span>
              </dd>
            </div>
          </dl>

          <div className="grid gap-6 px-5 py-4 sm:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
            <div>
              <SubHeading>Sebaran level BBM</SubHeading>
              <div className="flex h-[132px] items-end gap-2" role="img" aria-label={summary.levelBins.map((b) => `${b.label}: ${b.count} tangki`).join(", ")}>
                {summary.levelBins.map((bin, i) => (
                  <div key={bin.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                    <span className="tabular text-[11.5px] font-medium text-ink-2">{bin.count}</span>
                    <div
                      className={cn("w-full origin-bottom rounded-t-[3px] transition-[height] duration-700 ease-out", i === 0 ? "bg-warning/70" : "bg-accent/40")}
                      style={{ height: `${Math.max(4, (bin.count / maxBin) * 88)}%` }}
                    />
                    <span className="text-[10.5px] whitespace-nowrap text-subtle">{bin.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                <h3 className="eyebrow">Peringkat tangki</h3>
                <Tabs
                  label="Peringkat tangki"
                  value={ranking}
                  onChange={setRanking}
                  items={[
                    { value: "water", label: "Air tertinggi" },
                    { value: "low", label: "Level terendah" },
                  ]}
                />
              </div>
              <ul className="divide-y divide-line/70">
                {list.map((tank) => {
                  const active = selected?.deviceId === tank.deviceId;
                  const value = ranking === "water" ? tank.water : tank.level;
                  const max = ranking === "water" ? byWater[0]?.water ?? 1 : 100;
                  return (
                    <li key={tank.deviceId}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(tank.deviceId)}
                        aria-pressed={active}
                        className={cn(
                          "grid w-full grid-cols-[minmax(0,1fr)_72px_56px] items-center gap-3 rounded px-2 py-1.5 text-left transition-colors",
                          active ? "bg-accent-soft" : "hover:bg-hover"
                        )}
                      >
                        <span className="min-w-0">
                          <span className={cn("block font-mono text-[12px]", active ? "text-accent" : "text-ink")}>
                            {tank.deviceId}
                          </span>
                          <span className="block truncate text-[11px] text-muted">{buildingById.get(tank.buildingId)?.name}</span>
                        </span>
                        <span className="h-1 overflow-hidden rounded-full bg-white/[0.06]" aria-hidden>
                          <span
                            className={cn("block h-full rounded-full", ranking === "water" ? "bg-info/70" : "bg-warning/80")}
                            style={{ width: `${((value ?? 0) / max) * 100}%` }}
                          />
                        </span>
                        <span className="tabular text-right text-[12.5px] font-medium text-ink-2">
                          {value === null ? "—" : ranking === "water" ? `${formatNumber(value, 0)}` : `${formatNumber(value, 0)}%`}
                          {ranking === "water" ? <span className="ml-0.5 text-[10.5px] text-muted">ppm</span> : null}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
