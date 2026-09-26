import type { Building, Customer } from "@/types/building";
import { mockBuildings, mockCustomers } from "@/lib/mock-data/buildings";
import { load } from "./source";

export function getBuildings(): Promise<Building[]> {
  return load("/buildings", () => mockBuildings);
}

export function getCustomers(): Promise<Customer[]> {
  return load("/customers", () => mockCustomers);
}
