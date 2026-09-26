import type { AppNotification, SearchEntry } from "@/types/notification";
import type { Building } from "@/types/building";
import type { Device } from "@/types/device";
import type { ServiceTicket } from "@/types/service";
import { summarizeFleet } from "@/lib/analytics/devices";
import { summarizeSensors } from "@/lib/analytics/sensors";
import { summarizeContracts } from "@/lib/analytics/contracts";
import { summarizeTickets } from "@/lib/analytics/tickets";
import { CONNECTIVITY, LIFECYCLE, TICKET_STATUS } from "@/lib/constants/status";
import { WARRANTY_ALERT_DAYS } from "@/lib/constants";
import {
  formatRelative,
  formatSignedPercent,
  hoursSince,
  SNAPSHOT_MS,
} from "@/lib/utils/format";
import { getDevices } from "./deviceService";
import { getSensors } from "./sensorService";
import { getContracts } from "./contractService";
import { getTickets } from "./ticketService";
import { getBuildingEconomics } from "./economicsService";
import { getBuildings } from "./buildingService";

const minutesAgo = (m: number) => new Date(SNAPSHOT_MS - m * 60_000).toISOString();

/**
 * Notifikasi diturunkan dari kondisi data. Di backend, daftar ini berasal
 * dari rule engine alarm dan status baca per pengguna.
 */
export async function getNotifications(): Promise<AppNotification[]> {
  const [devices, sensors, contracts, tickets, economics, buildings] =
    await Promise.all([
      getDevices(),
      getSensors(),
      getContracts(),
      getTickets(),
      getBuildingEconomics(),
      getBuildings(),
    ]);

  const fleet = summarizeFleet(devices);
  const sensorSummary = summarizeSensors(sensors);
  const contractSummary = summarizeContracts(contracts);
  const ticketSummary = summarizeTickets(tickets);
  const buildingName = new Map(buildings.map((b) => [b.id, b.name]));

  const longestOffline = devices
    .filter((d) => d.connectivity === "offline" && d.lastSeen)
    .sort((a, b) => hoursSince(b.lastSeen as string) - hoursSince(a.lastSeen as string))[0];

  const gm014 = devices.find((d) => d.id === "GM-014");
  const worstBuilding = economics[0];

  const items: AppNotification[] = [];

  if (gm014 && gm014.connectivity === "offline") {
    items.push({
      id: "ntf-gm014",
      severity: "critical",
      title: "GM-014 berhenti mengirim data",
      description: `${buildingName.get(gm014.buildingId ?? "")} · terakhir ${formatRelative(gm014.lastSeen)}. Tiket dibuat, belum ada teknisi.`,
      href: "/devices?unit=GM-014",
      createdAt: minutesAgo(150),
    });
  }

  items.push({
    id: "ntf-offline",
    severity: "critical",
    title: `${fleet.offlineOver24h} unit offline lebih dari 24 jam`,
    description: longestOffline
      ? `Terlama ${longestOffline.id} di ${buildingName.get(longestOffline.buildingId ?? "")}, ${formatRelative(longestOffline.lastSeen)}.`
      : "Periksa daya dan konektivitas unit.",
    href: "/devices?status=offline",
    createdAt: minutesAgo(35),
  });

  if (ticketSummary.unassignedHighPriority > 0) {
    items.push({
      id: "ntf-tickets",
      severity: "warning",
      title: `${ticketSummary.unassignedHighPriority} tiket prioritas tinggi belum ditugaskan`,
      description: "Tugaskan teknisi supaya kunjungan bisa dijadwalkan hari ini.",
      href: "/service?status=open",
      createdAt: minutesAgo(90),
    });
  }

  items.push({
    id: "ntf-stuck",
    severity: "warning",
    title: `${sensorSummary.stuck} sensor pembacaannya macet`,
    description: "Nilai tidak berubah lebih dari 24 jam walau genset beroperasi.",
    href: "/sensors?status=stuck",
    createdAt: minutesAgo(240),
  });

  items.push({
    id: "ntf-warranty",
    severity: "warning",
    title: `Garansi ${contractSummary.warrantyExpiring} unit habis dalam ${WARRANTY_ALERT_DAYS} hari`,
    description: "Tawarkan perpanjangan garansi atau paket servis sebelum jatuh tempo.",
    href: "/contracts?filter=expiring",
    createdAt: minutesAgo(60 * 9),
  });

  if (worstBuilding) {
    items.push({
      id: "ntf-economics",
      severity: "info",
      title: `Biaya ${buildingName.get(worstBuilding.buildingId)} ${formatSignedPercent(worstBuilding.variancePct)} dari asumsi`,
      description: `Data baru ${worstBuilding.dataMonths} bulan, angka disetahunkan.`,
      href: "/economics",
      createdAt: minutesAgo(60 * 20),
    });
  }

  items.push({
    id: "ntf-firmware",
    severity: "info",
    title: `${fleet.outdatedUpdatable} unit siap diperbarui ke ${fleet.latestFirmware}`,
    description: "Pembaruan dilakukan jarak jauh, unit tetap mengirim data.",
    href: "/devices?firmware=outdated",
    createdAt: minutesAgo(60 * 26),
  });

  return items;
}

function deviceEntry(device: Device, buildings: Map<string, Building>): SearchEntry {
  const building = device.buildingId ? buildings.get(device.buildingId) : undefined;
  const status = device.connectivity
    ? CONNECTIVITY[device.connectivity].label
    : LIFECYCLE[device.lifecycle].label;
  return {
    kind: "device",
    id: device.id,
    title: device.id,
    subtitle: building?.name ?? "Gudang TANGKIS",
    status,
    meta:
      device.lifecycle === "installed" && device.lastSeen
        ? `Last seen ${formatRelative(device.lastSeen)}`
        : device.serial,
    href: `/devices?unit=${encodeURIComponent(device.id)}`,
    keywords: `${device.id} ${device.serial} ${building?.name ?? ""} ${building?.area ?? ""}`.toLowerCase(),
  };
}

export async function getSearchIndex(): Promise<SearchEntry[]> {
  const [devices, buildings, tickets] = await Promise.all([
    getDevices(),
    getBuildings(),
    getTickets(),
  ]);
  const buildingMap = new Map(buildings.map((b) => [b.id, b]));

  const buildingEntries: SearchEntry[] = buildings.map((b) => ({
    kind: "building",
    id: b.id,
    title: b.name,
    subtitle: `${b.area}, ${b.city}`,
    status: null,
    meta: `${devices.filter((d) => d.buildingId === b.id && d.lifecycle === "installed").length} unit terpasang`,
    href: `/devices?building=${b.id}`,
    keywords: `${b.name} ${b.code} ${b.city} ${b.area}`.toLowerCase(),
  }));

  const ticketEntries: SearchEntry[] = tickets.map((t: ServiceTicket) => ({
    kind: "ticket",
    id: t.id,
    title: t.id,
    subtitle: `${t.deviceId} · ${t.problem}`,
    status: TICKET_STATUS[t.status].label,
    meta: null,
    href: `/service?ticket=${t.id}`,
    keywords: `${t.id} ${t.deviceId} ${t.problem}`.toLowerCase(),
  }));

  return [
    ...devices.map((d) => deviceEntry(d, buildingMap)),
    ...buildingEntries,
    ...ticketEntries,
  ];
}
