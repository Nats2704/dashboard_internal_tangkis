import type { Contract, ContractSummary, WarrantyState } from "@/types/contract";
import { WARRANTY_ALERT_DAYS } from "@/lib/constants";
import { daysUntil } from "@/lib/utils/format";

export function warrantyState(contract: Contract): WarrantyState {
  const days = daysUntil(contract.warrantyEnd);
  if (days < 0) return "expired";
  if (days <= WARRANTY_ALERT_DAYS) return "expiring";
  return "active";
}

export function summarizeContracts(contracts: Contract[]): ContractSummary {
  return {
    total: contracts.length,
    owned: contracts.filter((c) => c.ownership === "owned").length,
    rental: contracts.filter((c) => c.ownership === "rental").length,
    warrantyExpiring: contracts.filter((c) => warrantyState(c) === "expiring")
      .length,
    warrantyExpired: contracts.filter((c) => warrantyState(c) === "expired")
      .length,
    dueWithin90Days: contracts.filter((c) => {
      const days = daysUntil(c.dueDate);
      return days >= 0 && days <= 90;
    }).length,
  };
}
