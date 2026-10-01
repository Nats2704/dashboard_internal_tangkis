import type { Device } from "@/types/device";
import type { Sensor } from "@/types/sensor";
import { LOW_BATTERY_PCT, WEAK_SIGNAL_DBM } from "@/lib/constants";

export type HealthLevel = "healthy" | "warning" | "critical";

export interface UnitHealth {
  level: HealthLevel;
  /** Alasan yang bisa ditampilkan ke operator, urut dari yang paling berat. */
  reasons: string[];
}

const SENSOR_ISSUES = new Set<Sensor["status"]>(["stuck", "out_of_range", "calibration"]);

/**
 * Klasifikasi kesehatan satu unit terpasang:
 * - kritis: unit offline, data tangki berhenti masuk;
 * - perhatian: maintenance, sensor bermasalah, baterai cadangan rendah, atau sinyal lemah;
 * - sehat: selain itu.
 */
export function classifyUnit(device: Device, sensors: Sensor[] = []): UnitHealth {
  if (device.connectivity === "offline") return { level: "critical", reasons: ["Offline"] };
  const reasons: string[] = [];
  if (device.connectivity === "maintenance") reasons.push("Maintenance");
  if (sensors.some((s) => SENSOR_ISSUES.has(s.status))) reasons.push("Sensor bermasalah");
  if (device.batteryPct !== null && device.batteryPct < LOW_BATTERY_PCT) reasons.push("Baterai rendah");
  if (device.signalDbm !== null && device.signalDbm < WEAK_SIGNAL_DBM) reasons.push("Sinyal lemah");
  return { level: reasons.length ? "warning" : "healthy", reasons };
}

export function groupSensorsByDevice(sensors: Sensor[]): Map<string, Sensor[]> {
  const map = new Map<string, Sensor[]>();
  for (const s of sensors) {
    const list = map.get(s.deviceId) ?? [];
    list.push(s);
    map.set(s.deviceId, list);
  }
  return map;
}

export interface HealthSummary {
  installed: number;
  healthy: number;
  warning: number;
  critical: number;
  /** Porsi unit sehat dari unit terpasang, dalam persen. */
  healthPct: number;
  /** Porsi unit yang masih mengirim data (online + maintenance). */
  reportingPct: number;
  breakdown: {
    maintenance: number;
    sensorIssue: number;
    lowBattery: number;
    weakSignal: number;
  };
}

export function summarizeHealth(devices: Device[], sensors: Sensor[]): HealthSummary {
  const byDevice = groupSensorsByDevice(sensors);
  const installed = devices.filter((d) => d.lifecycle === "installed");
  const summary: HealthSummary = {
    installed: installed.length,
    healthy: 0,
    warning: 0,
    critical: 0,
    healthPct: 0,
    reportingPct: 0,
    breakdown: { maintenance: 0, sensorIssue: 0, lowBattery: 0, weakSignal: 0 },
  };
  for (const d of installed) {
    const { level, reasons } = classifyUnit(d, byDevice.get(d.id));
    summary[level] += 1;
    if (level !== "warning") continue;
    if (reasons.includes("Maintenance")) summary.breakdown.maintenance += 1;
    if (reasons.includes("Sensor bermasalah")) summary.breakdown.sensorIssue += 1;
    if (reasons.includes("Baterai rendah")) summary.breakdown.lowBattery += 1;
    if (reasons.includes("Sinyal lemah")) summary.breakdown.weakSignal += 1;
  }
  const base = Math.max(1, installed.length);
  summary.healthPct = (summary.healthy / base) * 100;
  summary.reportingPct = ((installed.length - summary.critical) / base) * 100;
  return summary;
}

export const HEALTH_RANK: Record<HealthLevel, number> = { critical: 0, warning: 1, healthy: 2 };
