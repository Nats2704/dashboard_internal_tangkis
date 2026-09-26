import type { InventoryFlow, InventoryRecord } from "@/types/inventory";
import { WAREHOUSE_LOCATION, WORKSHOP_LOCATION } from "@/lib/constants";
import { formatDate, SNAPSHOT_MS } from "@/lib/utils/format";
import { mockBuildings } from "./buildings";
import { mockDevices } from "./devices";
import { createRandom, isoOffset } from "./random";

const rng = createRandom(1204);
const buildingById = new Map(mockBuildings.map((b) => [b.id, b]));

const REPAIR_REASONS = [
  "Probe level retak, menunggu suku cadang",
  "Modul modem rusak setelah lonjakan tegangan",
  "Enclosure bocor, papan utama terkena kondensasi",
  "Baterai cadangan menggembung",
  "Konektor probe korosi",
];

const RECEIPT_BATCHES = ["B-2605", "B-2607", "B-2608"];

function buildInventory(): InventoryRecord[] {
  return mockDevices.map((device) => {
    const building = device.buildingId ? buildingById.get(device.buildingId) : null;
    const installedLabel = building ? `Dipasang di ${building.name}` : "Dipasang";

    switch (device.lifecycle) {
      case "installed":
        return {
          deviceId: device.id,
          stage: "installed",
          location: building?.name ?? "—",
          since: device.installedAt as string,
          note: device.tankLabel ?? "",
          history: [
            { date: device.installedAt as string, label: installedLabel },
            {
              date: isoOffset(Date.parse(device.installedAt as string), 24 * 7),
              label: "Diterima dari produksi dan lolos uji fungsi",
            },
          ],
        };
      case "repair": {
        const sentAt = device.lastSeen as string;
        return {
          deviceId: device.id,
          stage: "repair",
          location: WORKSHOP_LOCATION,
          since: sentAt,
          note: rng.pick(REPAIR_REASONS),
          history: [
            { date: sentAt, label: `Dilepas dari ${building?.name ?? "lokasi"}, dikirim ke workshop` },
            { date: device.installedAt as string, label: installedLabel },
          ],
        };
      }
      case "returned": {
        const returnedAt = isoOffset(Date.parse(device.lastSeen as string), -30);
        return {
          deviceId: device.id,
          stage: "returned",
          location: WAREHOUSE_LOCATION,
          since: returnedAt,
          note: `Kontrak sewa ${building?.name ?? ""} berakhir. Menunggu pemeriksaan sebelum dipasang ulang.`,
          history: [
            { date: returnedAt, label: "Diterima di gudang, status: perlu pemeriksaan" },
            { date: device.lastSeen as string, label: `Ditarik dari ${building?.name ?? "pelanggan"}` },
            { date: device.installedAt as string, label: installedLabel },
          ],
        };
      }
      case "warehouse": {
        const batch = rng.pick(RECEIPT_BATCHES);
        const receivedAt = isoOffset(SNAPSHOT_MS, rng.int(6, 110) * 24);
        return {
          deviceId: device.id,
          stage: "warehouse",
          location: WAREHOUSE_LOCATION,
          since: receivedAt,
          note: `Batch produksi ${batch}, firmware ${device.firmware}, siap pasang`,
          history: [
            { date: receivedAt, label: `Diterima dari produksi batch ${batch} (${formatDate(receivedAt)})` },
          ],
        };
      }
    }
  });
}

export const mockInventory: InventoryRecord[] = buildInventory();

/** Perpindahan stok selama 90 hari terakhir (dari log mutasi gudang). */
export const mockInventoryFlows: InventoryFlow[] = [
  { from: "warehouse", to: "installed", count: 46 },
  // 33 unit masuk workshop, 11 sudah kembali terpasang, 22 masih diperbaiki.
  { from: "installed", to: "repair", count: 33 },
  { from: "repair", to: "installed", count: 11 },
  { from: "installed", to: "returned", count: 12 },
];
