import type { ConnectivityStatus, Device } from "@/types/device";
import { LATEST_FIRMWARE } from "@/lib/constants";
import { SNAPSHOT_MS } from "@/lib/utils/format";
import { buildingPlans } from "./buildings";
import { addDays, clamp, createRandom, isoOffset, round, wib } from "./random";

const rng = createRandom(20260926);

const TOTAL_WAREHOUSE = 78;
const OFFLINE_COUNT = 24;
const MAINTENANCE_COUNT = 14;
const OUTDATED_ONLINE_COUNT = 18;

const MAINTENANCE_NOTES = [
  "Pembersihan tangki terjadwal oleh vendor",
  "Penggantian probe level",
  "Relokasi unit ke ruang genset baru",
  "Kalibrasi ulang sensor kadar air",
  "Penggantian baterai cadangan",
  "Perbaikan panel daya ruang genset",
];

function unitCode(code: string, n: number): string {
  return `${code}-${String(n).padStart(3, "0")}`;
}

function tankLabel(index: number, telco: boolean): string {
  if (telco) return `Site ${String(index).padStart(2, "0")} · tangki genset`;
  const genset = Math.ceil(index / 2);
  return index % 2 === 1
    ? `Genset ${genset} · tangki harian`
    : `Genset ${genset} · tangki utama`;
}

let serialCounter = 140;
function nextSerial(year: number): string {
  serialCounter += rng.int(1, 3);
  return `TKS-${String(year).slice(2)}-${String(serialCounter).padStart(4, "0")}`;
}

function buildDevices(): Device[] {
  const devices: Device[] = [];

  for (const plan of buildingPlans) {
    const telco = plan.code === "MTN" || plan.code === "MTB";
    const year = Number(plan.contractStart.slice(0, 4));
    let n = 0;

    for (let i = 0; i < plan.installed; i++) {
      n += 1;
      devices.push({
        id: unitCode(plan.code, n),
        serial: nextSerial(year),
        buildingId: plan.buildingId,
        tankLabel: tankLabel(n, telco),
        lifecycle: "installed",
        connectivity: "online",
        lastSeen: null,
        signalDbm: null,
        batteryPct: null,
        firmware: LATEST_FIRMWARE,
        installedAt: wib(addDays(plan.contractStart, rng.int(0, 12))),
        maintenanceNote: null,
      });
    }

    for (let i = 0; i < plan.repair; i++) {
      n += 1;
      devices.push({
        id: unitCode(plan.code, n),
        serial: nextSerial(year),
        buildingId: plan.buildingId,
        tankLabel: tankLabel(n, telco),
        lifecycle: "repair",
        connectivity: null,
        lastSeen: isoOffset(SNAPSHOT_MS, rng.int(3, 21) * 24 + rng.int(0, 8)),
        signalDbm: null,
        batteryPct: null,
        firmware: rng.next() < 0.5 ? "v2.3.9" : LATEST_FIRMWARE,
        installedAt: wib(addDays(plan.contractStart, rng.int(0, 12))),
        maintenanceNote: null,
      });
    }

    for (let i = 0; i < plan.returned; i++) {
      n += 1;
      devices.push({
        id: unitCode(plan.code, n),
        serial: nextSerial(year),
        buildingId: plan.buildingId,
        tankLabel: tankLabel(n, telco),
        lifecycle: "returned",
        connectivity: null,
        lastSeen: isoOffset(SNAPSHOT_MS, rng.int(18, 22) * 24),
        signalDbm: null,
        batteryPct: null,
        firmware: "v2.3.9",
        installedAt: wib(addDays(plan.contractStart, rng.int(0, 12))),
        maintenanceNote: null,
      });
    }
  }

  for (let i = 0; i < TOTAL_WAREHOUSE; i++) {
    devices.push({
      id: `TK-${String(1201 + i * 3).padStart(4, "0")}`,
      serial: nextSerial(2026),
      buildingId: null,
      tankLabel: null,
      lifecycle: "warehouse",
      connectivity: null,
      lastSeen: null,
      signalDbm: null,
      batteryPct: null,
      firmware: LATEST_FIRMWARE,
      installedAt: null,
      maintenanceNote: null,
    });
  }

  assignConnectivity(devices);

  // LBP-001 adalah unit pilot yang dipasang lebih awal dari unit lain di gedung itu.
  const pilot = devices.find((d) => d.id === "LBP-001");
  if (pilot) pilot.installedAt = wib("2024-10-20");

  return devices;
}

function assignConnectivity(devices: Device[]) {
  const installed = devices.filter((d) => d.lifecycle === "installed");
  const pinnedOnline = new Set(["GM-001", "UNIV-003"]);
  const pinnedOffline = "GM-014";

  // Unit offline cenderung mengumpul di klaster BTS dan gudang dengan pasokan
  // daya kurang stabil, bukan tersebar merata di semua gedung.
  const pronePrefixes = ["MTN-", "MTB-", "GBC-", "PMJ-", "RSM-"];
  const weight = (d: Device) => (pronePrefixes.some((p) => d.id.startsWith(p)) ? 0.22 : 1);
  const pool = installed
    .filter((d) => !pinnedOnline.has(d.id) && d.id !== pinnedOffline)
    .map((d) => ({ d, key: rng.next() * weight(d) }))
    .sort((a, b) => a.key - b.key)
    .map((x) => x.d);

  const statusById = new Map<string, ConnectivityStatus>();
  statusById.set(pinnedOffline, "offline");
  pool.slice(0, OFFLINE_COUNT - 1).forEach((d) => statusById.set(d.id, "offline"));
  rng
    .shuffle(pool.slice(OFFLINE_COUNT - 1))
    .slice(0, MAINTENANCE_COUNT)
    .forEach((d) => statusById.set(d.id, "maintenance"));

  let offlineIndex = 0;
  for (const device of installed) {
    const status = statusById.get(device.id) ?? "online";
    device.connectivity = status;

    if (status === "online") {
      device.lastSeen = isoOffset(SNAPSHOT_MS, rng.float(1, 14) / 60);
      device.signalDbm = Math.round(clamp(rng.normal(-71, 8), -99, -53));
      device.batteryPct = Math.round(clamp(rng.normal(80, 9), 46, 100));
    } else if (status === "maintenance") {
      device.lastSeen = isoOffset(SNAPSHOT_MS, rng.float(0.3, 1.8));
      device.signalDbm = Math.round(clamp(rng.normal(-76, 8), -99, -55));
      device.batteryPct = Math.round(clamp(rng.normal(72, 10), 35, 98));
      device.maintenanceNote = rng.pick(MAINTENANCE_NOTES);
    } else {
      // Enam unit offline lebih dari 24 jam, sisanya baru terputus.
      const hours =
        device.id === pinnedOffline
          ? 3
          : offlineIndex < 6
            ? rng.float(26, 96)
            : rng.float(2.2, 20);
      if (device.id !== pinnedOffline) offlineIndex += 1;
      device.lastSeen = isoOffset(SNAPSHOT_MS, hours);
      device.signalDbm = null;
      device.batteryPct = Math.round(clamp(rng.normal(52, 14), 14, 78));
    }
  }

  const gm014 = devices.find((d) => d.id === pinnedOffline);
  if (gm014) {
    gm014.batteryPct = 65;
    gm014.firmware = "v2.3.9";
  }
  const gm001 = devices.find((d) => d.id === "GM-001");
  if (gm001) {
    gm001.signalDbm = -65;
    gm001.batteryPct = 82;
    gm001.lastSeen = isoOffset(SNAPSHOT_MS, 6 / 60);
  }

  // 18 unit online masih menjalankan firmware lama dan bisa diperbarui via OTA.
  const onlineCandidates = rng.shuffle(
    installed.filter((d) => d.connectivity === "online" && !pinnedOnline.has(d.id))
  );
  onlineCandidates.slice(0, OUTDATED_ONLINE_COUNT).forEach((d, i) => {
    d.firmware = i < 11 ? "v2.3.9" : "v2.3.7";
  });

  for (const device of installed) {
    if (device.signalDbm !== null) device.signalDbm = round(device.signalDbm);
  }
}

export const mockDevices: Device[] = buildDevices();
