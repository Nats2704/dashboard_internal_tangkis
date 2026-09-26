import type { Device, LifecycleStage } from "@/types/device";
import type { InventorySummary } from "@/types/inventory";

export const LIFECYCLE_ORDER: LifecycleStage[] = [
  "warehouse",
  "installed",
  "repair",
  "returned",
];

export function summarizeInventory(devices: Device[]): InventorySummary {
  const byStage: Record<LifecycleStage, number> = {
    warehouse: 0,
    installed: 0,
    repair: 0,
    returned: 0,
  };
  for (const d of devices) byStage[d.lifecycle] += 1;
  return {
    total: devices.length,
    byStage,
    // Unit gudang siap pasang + unit tarikan yang lolos pemeriksaan.
    redeployable: byStage.warehouse + byStage.returned,
  };
}
