import type { Contract } from "@/types/contract";
import { mockContracts } from "@/lib/mock-data/contracts";
import { load } from "./source";

export function getContracts(): Promise<Contract[]> {
  return load("/contracts", () => mockContracts);
}
