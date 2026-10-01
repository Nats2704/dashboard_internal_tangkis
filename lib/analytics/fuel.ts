import type { Sensor, SensorKind } from "@/types/sensor";

/** Pembacaan yang layak dipakai: ada nilai dan bukan di luar rentang fisik. */
export function usableReading(sensor: Sensor | undefined): number | null {
  if (!sensor || sensor.status === "out_of_range" || sensor.status === "no_data") return null;
  return sensor.currentReading;
}

export interface TankReading {
  deviceId: string;
  buildingId: string;
  level: number | null;
  water: number | null;
  temperature: number | null;
  sensors: Partial<Record<SensorKind, Sensor>>;
}

/** Satu baris per tangki (unit), menggabungkan tiga sensornya. */
export function tankReadings(sensors: Sensor[]): TankReading[] {
  const map = new Map<string, TankReading>();
  for (const s of sensors) {
    const tank =
      map.get(s.deviceId) ??
      ({ deviceId: s.deviceId, buildingId: s.buildingId, level: null, water: null, temperature: null, sensors: {} } as TankReading);
    tank.sensors[s.kind] = s;
    tank[s.kind === "level" ? "level" : s.kind === "water" ? "water" : "temperature"] = usableReading(s);
    map.set(s.deviceId, tank);
  }
  return [...map.values()];
}

function average(values: number[]): number | null {
  return values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : null;
}

export interface FuelSummary {
  reporting: number;
  total: number;
  avgLevel: number | null;
  avgWater: number | null;
  avgTemperature: number | null;
  levelBins: { label: string; min: number; max: number; count: number }[];
}

export function summarizeFuel(tanks: TankReading[]): FuelSummary {
  const levels = tanks.map((t) => t.level).filter((v): v is number => v !== null);
  const bins = [
    { label: "< 25%", min: 0, max: 25, count: 0 },
    { label: "25–50%", min: 25, max: 50, count: 0 },
    { label: "50–75%", min: 50, max: 75, count: 0 },
    { label: "> 75%", min: 75, max: Infinity, count: 0 },
  ];
  for (const v of levels) {
    const bin = bins.find((b) => v >= b.min && v < b.max);
    if (bin) bin.count += 1;
  }
  return {
    reporting: levels.length,
    total: tanks.length,
    avgLevel: average(levels),
    avgWater: average(tanks.map((t) => t.water).filter((v): v is number => v !== null)),
    avgTemperature: average(tanks.map((t) => t.temperature).filter((v): v is number => v !== null)),
    levelBins: bins,
  };
}
