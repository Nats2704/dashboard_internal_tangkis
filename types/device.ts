export type ConnectivityStatus = "online" | "offline" | "maintenance";

/** Posisi unit dalam siklus hidup stok. */
export type LifecycleStage = "warehouse" | "installed" | "repair" | "returned";

export interface Device {
  /** Kode operasional, misalnya "GM-014". Unit gudang memakai kode "TK-xxxx". */
  id: string;
  serial: string;
  /** Gedung tempat unit terpasang atau terakhir terpasang. */
  buildingId: string | null;
  tankLabel: string | null;
  lifecycle: LifecycleStage;
  /** Hanya berlaku untuk unit terpasang. */
  connectivity: ConnectivityStatus | null;
  lastSeen: string | null;
  signalDbm: number | null;
  batteryPct: number | null;
  firmware: string;
  installedAt: string | null;
  maintenanceNote: string | null;
}

export interface FleetSummary {
  total: number;
  installed: number;
  online: number;
  offline: number;
  maintenance: number;
  avgSignalDbm: number;
  avgBatteryPct: number;
  latestFirmware: string;
  outdatedFirmware: number;
  outdatedUpdatable: number;
  offlineOver24h: number;
  weakSignal: number;
  lowBattery: number;
}
