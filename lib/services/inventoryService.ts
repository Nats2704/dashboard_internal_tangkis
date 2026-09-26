import type { InventoryFlow, InventoryRecord } from "@/types/inventory";
import { mockInventory, mockInventoryFlows } from "@/lib/mock-data/inventory";
import { load } from "./source";

export function getInventory(): Promise<InventoryRecord[]> {
  return load("/inventory", () => mockInventory);
}

export function getInventoryFlows(): Promise<InventoryFlow[]> {
  return load("/inventory/flows?days=90", () => mockInventoryFlows);
}
