import type { Device, FleetSummary } from "@/types/device";
import {
  LATEST_FIRMWARE,
  LOW_BATTERY_PCT,
  WEAK_SIGNAL_DBM,
} from "@/lib/constants";
import { hoursSince } from "@/lib/utils/format";

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function isOutdated(device: Device): boolean {
  return compareVersions(device.firmware, LATEST_FIRMWARE) < 0;
}

export function compareVersions(a: string, b: string): number {
  const pa = a.replace(/^v/, "").split(".").map(Number);
  const pb = b.replace(/^v/, "").split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

export function summarizeFleet(devices: Device[]): FleetSummary {
  const installed = devices.filter((d) => d.lifecycle === "installed");
  const online = installed.filter((d) => d.connectivity === "online");
  const offline = installed.filter((d) => d.connectivity === "offline");
  const reporting = installed.filter((d) => d.connectivity !== "offline");
  const outdated = installed.filter(isOutdated);

  return {
    total: devices.length,
    installed: installed.length,
    online: online.length,
    offline: offline.length,
    maintenance: installed.filter((d) => d.connectivity === "maintenance").length,
    avgSignalDbm: Math.round(
      average(
        reporting
          .map((d) => d.signalDbm)
          .filter((v): v is number => v !== null)
      )
    ),
    avgBatteryPct: Math.round(
      average(
        installed
          .map((d) => d.batteryPct)
          .filter((v): v is number => v !== null)
      )
    ),
    latestFirmware: LATEST_FIRMWARE,
    outdatedFirmware: outdated.length,
    outdatedUpdatable: outdated.filter((d) => d.connectivity === "online").length,
    offlineOver24h: offline.filter((d) => d.lastSeen && hoursSince(d.lastSeen) > 24)
      .length,
    weakSignal: reporting.filter(
      (d) => d.signalDbm !== null && d.signalDbm < WEAK_SIGNAL_DBM
    ).length,
    lowBattery: installed.filter(
      (d) => d.batteryPct !== null && d.batteryPct < LOW_BATTERY_PCT
    ).length,
  };
}

/** Sebaran kekuatan sinyal untuk unit yang melapor. */
export function signalDistribution(devices: Device[]) {
  const buckets = [
    { label: "Sangat baik", range: "> −65 dBm", min: -65, max: 0, count: 0 },
    { label: "Baik", range: "−65 s/d −80", min: -80, max: -65, count: 0 },
    { label: "Cukup", range: "−80 s/d −90", min: -90, max: -80, count: 0 },
    { label: "Lemah", range: "< −90 dBm", min: -200, max: -90, count: 0 },
  ];
  for (const d of devices) {
    if (d.lifecycle !== "installed" || d.signalDbm === null) continue;
    const bucket = buckets.find((b) => d.signalDbm! > b.min && d.signalDbm! <= b.max);
    if (bucket) bucket.count += 1;
  }
  return buckets;
}

export function firmwareDistribution(devices: Device[]) {
  const counts = new Map<string, number>();
  for (const d of devices) {
    if (d.lifecycle !== "installed") continue;
    counts.set(d.firmware, (counts.get(d.firmware) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([version, count]) => ({ version, count }))
    .sort((a, b) => compareVersions(b.version, a.version));
}

/** Urutan prioritas untuk tabel: offline dulu, lalu maintenance, lalu online. */
export function connectivityRank(device: Device): number {
  switch (device.connectivity) {
    case "offline":
      return 0;
    case "maintenance":
      return 1;
    case "online":
      return 2;
    default:
      return 3;
  }
}
