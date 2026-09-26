import type { Sensor, SensorKind, SensorStatus, SensorTrendPoint } from "@/types/sensor";
import { SENSOR_KIND } from "@/lib/constants/status";
import { summarizeSensors } from "@/lib/analytics/sensors";
import { SNAPSHOT_MS } from "@/lib/utils/format";
import { mockDevices } from "./devices";
import { addDays, clamp, createRandom, round, wib } from "./random";

const rng = createRandom(3906);

const KINDS: SensorKind[] = ["level", "water", "temperature"];

const STUCK_COUNT = 4;
const OUT_OF_RANGE_COUNT = 9;
const CALIBRATION_COUNT = 24;

function baseReading(kind: SensorKind): number {
  switch (kind) {
    case "level":
      return rng.float(28, 94);
    case "water":
      return rng.float(60, 360);
    case "temperature":
      return rng.float(27, 35);
  }
}

function implausibleReading(kind: SensorKind): number {
  switch (kind) {
    case "level":
      return rng.float(104, 121);
    case "water":
      return -rng.float(8, 40);
    case "temperature":
      return rng.float(64, 82);
  }
}

function randomDate(from: string, spanDays: number): string {
  return wib(addDays(from, rng.int(0, spanDays)), "10:00");
}

function buildSensors(): Sensor[] {
  const installed = mockDevices.filter((d) => d.lifecycle === "installed");
  const sensors: Sensor[] = [];

  for (const device of installed) {
    for (const kind of KINDS) {
      sensors.push({
        id: `${device.id}-${SENSOR_KIND[kind].suffix}`,
        deviceId: device.id,
        buildingId: device.buildingId as string,
        kind,
        currentReading: null,
        lastReading: null,
        labResult: null,
        deviationPct: null,
        lastCalibration: randomDate("2025-11-01", 290),
        lastLabSample: randomDate("2026-07-20", 55),
        status: device.connectivity === "offline" ? "no_data" : "normal",
        stuckHours: null,
      });
    }
  }

  const evaluable = rng.shuffle(sensors.filter((s) => s.status !== "no_data"));
  const assign = (list: Sensor[], status: SensorStatus) =>
    list.forEach((s) => (s.status = status));
  assign(evaluable.slice(0, STUCK_COUNT), "stuck");
  assign(evaluable.slice(STUCK_COUNT, STUCK_COUNT + OUT_OF_RANGE_COUNT), "out_of_range");
  assign(
    evaluable.slice(
      STUCK_COUNT + OUT_OF_RANGE_COUNT,
      STUCK_COUNT + OUT_OF_RANGE_COUNT + CALIBRATION_COUNT
    ),
    "calibration"
  );

  const decimalsFor = (kind: SensorKind) => SENSOR_KIND[kind].decimals;

  for (const sensor of sensors) {
    const lab = baseReading(sensor.kind);
    const decimals = decimalsFor(sensor.kind);
    const sign = rng.next() < 0.5 ? -1 : 1;
    let deviation: number;

    switch (sensor.status) {
      case "calibration":
        deviation = sign * rng.float(5.4, 11.5);
        sensor.lastCalibration = randomDate("2025-02-01", 180);
        break;
      case "stuck":
        deviation = sign * rng.float(2.5, 7.5);
        sensor.stuckHours = rng.int(26, 70);
        break;
      default:
        deviation = sign * clamp(Math.abs(rng.normal(2.72, 1.05)), 0.2, 4.8);
    }

    sensor.labResult = round(lab, decimals);
    const reading = round(lab * (1 + deviation / 100), decimals);

    if (sensor.status === "out_of_range") {
      sensor.currentReading = round(implausibleReading(sensor.kind), decimals);
      sensor.lastReading = round(reading, decimals);
      sensor.deviationPct = null;
    } else if (sensor.status === "no_data") {
      sensor.currentReading = null;
      sensor.lastReading = reading;
      sensor.deviationPct = round(deviation, 1);
    } else if (sensor.status === "stuck") {
      sensor.currentReading = reading;
      sensor.lastReading = reading;
      sensor.deviationPct = round(deviation, 1);
    } else {
      sensor.currentReading = reading;
      const drift = sensor.kind === "water" ? rng.float(-6, 6) : rng.float(-0.6, 0.6);
      sensor.lastReading = round(reading + drift, decimals);
      sensor.deviationPct = round(deviation, 1);
    }
  }

  return sensors;
}

export const mockSensors: Sensor[] = buildSensors();

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function buildTrend(): SensorTrendPoint[] {
  const current = summarizeSensors(mockSensors);
  const weeks = 12;
  const trendRng = createRandom(77);
  const points: SensorTrendPoint[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const date = new Date(SNAPSHOT_MS - i * WEEK_MS + 7 * 3600 * 1000);
    const label = `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`;
    if (i === 0) {
      points.push({
        label,
        avgDeviationPct: round(current.avgDeviationPct, 2),
        normalPct: round(current.normalPct, 1),
      });
      continue;
    }
    // Deviasi rata-rata naik perlahan sejak kalibrasi massal awal Juli.
    const progress = (weeks - 1 - i) / (weeks - 1);
    points.push({
      label,
      avgDeviationPct: round(2.05 + progress * (current.avgDeviationPct - 2.05) + trendRng.float(-0.12, 0.12), 2),
      normalPct: round(98.4 - progress * (98.4 - current.normalPct) + trendRng.float(-0.25, 0.25), 1),
    });
  }
  return points;
}

export const mockSensorTrend: SensorTrendPoint[] = buildTrend();
