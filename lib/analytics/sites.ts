import type { Building } from "@/types/building";
import type { Device } from "@/types/device";
import type { Sensor } from "@/types/sensor";
import { classifyUnit, groupSensorsByDevice, HEALTH_RANK, type HealthLevel } from "./health";
import { usableReading } from "./fuel";

export interface SiteUnit {
  device: Device;
  level: HealthLevel;
  reasons: string[];
}

export interface SiteSummary {
  building: Building;
  units: SiteUnit[];
  counts: Record<HealthLevel, number>;
  /** Status terburuk di gedung. */
  level: HealthLevel;
  avgFuelLevel: number | null;
  minFuelLevel: number | null;
  avgSignalDbm: number | null;
}

/** Ringkasan per gedung untuk tampilan armada; gedung tanpa unit terpasang dilewati. */
export function summarizeSites(buildings: Building[], devices: Device[], sensors: Sensor[]): SiteSummary[] {
  const sensorsByDevice = groupSensorsByDevice(sensors);
  return buildings
    .map((building) => {
      const units = devices
        .filter((d) => d.buildingId === building.id && d.lifecycle === "installed")
        .map((device) => ({ device, ...classifyUnit(device, sensorsByDevice.get(device.id)) }))
        .sort(
          (a, b) =>
            HEALTH_RANK[a.level] - HEALTH_RANK[b.level] ||
            a.device.id.localeCompare(b.device.id, "id", { numeric: true })
        );
      const counts: Record<HealthLevel, number> = { healthy: 0, warning: 0, critical: 0 };
      for (const u of units) counts[u.level] += 1;
      const level: HealthLevel = counts.critical ? "critical" : counts.warning ? "warning" : "healthy";

      const fuel = units
        .map((u) => usableReading(sensorsByDevice.get(u.device.id)?.find((s) => s.kind === "level")))
        .filter((v): v is number => v !== null);
      const signal = units.map((u) => u.device.signalDbm).filter((v): v is number => v !== null);

      return {
        building,
        units,
        counts,
        level,
        avgFuelLevel: fuel.length ? fuel.reduce((s, v) => s + v, 0) / fuel.length : null,
        minFuelLevel: fuel.length ? Math.min(...fuel) : null,
        avgSignalDbm: signal.length ? signal.reduce((s, v) => s + v, 0) / signal.length : null,
      };
    })
    .filter((site) => site.units.length > 0)
    .sort(
      (a, b) =>
        HEALTH_RANK[a.level] - HEALTH_RANK[b.level] ||
        b.counts.critical - a.counts.critical ||
        b.counts.warning / b.units.length - a.counts.warning / a.units.length
    );
}
