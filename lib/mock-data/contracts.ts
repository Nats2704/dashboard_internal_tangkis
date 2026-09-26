import type { Contract } from "@/types/contract";
import { SNAPSHOT_MS } from "@/lib/utils/format";
import { buildingPlans } from "./buildings";
import { mockDevices } from "./devices";
import { addMonths, wib } from "./random";

const planByBuilding = new Map(buildingPlans.map((p) => [p.buildingId, p]));

/**
 * Langganan pemantauan unit milik pelanggan ditagih tahunan, dimulai satu
 * bulan setelah pemasangan (bulan pertama masa komisioning).
 */
function nextRenewal(start: string): string {
  const billingStart = addMonths(start, 1);
  let years = 1;
  while (Date.parse(wib(addMonths(billingStart, years * 12))) < SNAPSHOT_MS) years += 1;
  return addMonths(billingStart, years * 12);
}

function buildContracts(): Contract[] {
  const contracts: Contract[] = [];
  let sequence = 311;

  for (const device of mockDevices) {
    // Kontrak aktif hanya untuk unit yang terpasang atau sedang diperbaiki.
    if (device.lifecycle !== "installed" && device.lifecycle !== "repair") continue;
    if (!device.buildingId || !device.installedAt) continue;
    const plan = planByBuilding.get(device.buildingId);
    if (!plan) continue;

    const start = device.installedAt.slice(0, 10);
    sequence += 1;
    const isRental = plan.ownership === "rental";
    const end = addMonths(start, 36);

    contracts.push({
      id: `KTR-${start.slice(2, 4)}${start.slice(5, 7)}-${String(sequence).padStart(4, "0")}`,
      deviceId: device.id,
      customerId: plan.customerId,
      buildingId: device.buildingId,
      ownership: plan.ownership,
      startDate: wib(start),
      warrantyEnd: wib(isRental ? end : addMonths(start, 24)),
      dueDate: wib(isRental ? end : nextRenewal(start)),
    });
  }
  return contracts;
}

export const mockContracts: Contract[] = buildContracts();
