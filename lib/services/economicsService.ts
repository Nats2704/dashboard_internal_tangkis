import type { BuildingEconomicsRow } from "@/types/economics";
import { mockEconomics } from "@/lib/mock-data/economics";
import { toEconomicsRow } from "@/lib/analytics/economics";
import { load } from "./source";

export async function getBuildingEconomics(): Promise<BuildingEconomicsRow[]> {
  const items = await load("/economics/buildings", () => mockEconomics);
  return items.map((item) => toEconomicsRow(item)).sort((a, b) => b.variancePct - a.variancePct);
}
