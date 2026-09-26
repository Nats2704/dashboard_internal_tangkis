export type Ownership = "owned" | "rental";

export type WarrantyState = "active" | "expiring" | "expired";

export interface Contract {
  id: string;
  deviceId: string;
  customerId: string;
  buildingId: string;
  ownership: Ownership;
  startDate: string;
  warrantyEnd: string;
  /** Sewa: akhir kontrak. Milik pelanggan: perpanjangan langganan pemantauan. */
  dueDate: string;
}

export interface ContractSummary {
  total: number;
  owned: number;
  rental: number;
  warrantyExpiring: number;
  warrantyExpired: number;
  dueWithin90Days: number;
}
