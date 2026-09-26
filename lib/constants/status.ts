import type { ConnectivityStatus, LifecycleStage } from "@/types/device";
import type { SensorKind, SensorStatus } from "@/types/sensor";
import type { Ownership, WarrantyState } from "@/types/contract";
import type {
  TicketCause,
  TicketPriority,
  TicketStatus,
} from "@/types/service";
import type {
  VendorRequestStatus,
  VendorServiceType,
} from "@/types/vendor";
import type { BuildingCategory } from "@/types/building";
import type { VarianceLevel } from "@/types/economics";

/** Nada visual untuk Badge dan indikator status. */
export type Tone = "success" | "warning" | "danger" | "info" | "neutral";

interface LabelTone {
  label: string;
  tone: Tone;
}

export const CONNECTIVITY: Record<ConnectivityStatus, LabelTone> = {
  online: { label: "Online", tone: "success" },
  offline: { label: "Offline", tone: "danger" },
  maintenance: { label: "Maintenance", tone: "warning" },
};

export const LIFECYCLE: Record<LifecycleStage, LabelTone> = {
  warehouse: { label: "Di Gudang", tone: "neutral" },
  installed: { label: "Terpasang", tone: "success" },
  repair: { label: "Dalam Perbaikan", tone: "warning" },
  returned: { label: "Ditarik Kembali", tone: "info" },
};

export const SENSOR_STATUS: Record<SensorStatus, LabelTone> = {
  normal: { label: "Normal", tone: "success" },
  stuck: { label: "Macet", tone: "danger" },
  out_of_range: { label: "Di luar rentang", tone: "danger" },
  calibration: { label: "Perlu kalibrasi", tone: "warning" },
  no_data: { label: "Tanpa data", tone: "neutral" },
};

export const SENSOR_KIND: Record<
  SensorKind,
  { label: string; unit: string; decimals: number; suffix: string }
> = {
  level: { label: "Level BBM", unit: "%", decimals: 1, suffix: "LV" },
  water: { label: "Kadar air", unit: "ppm", decimals: 0, suffix: "AIR" },
  temperature: { label: "Suhu tangki", unit: "°C", decimals: 1, suffix: "SH" },
};

export const OWNERSHIP: Record<Ownership, LabelTone> = {
  owned: { label: "Milik pelanggan", tone: "neutral" },
  rental: { label: "Sewa", tone: "info" },
};

export const WARRANTY: Record<WarrantyState, LabelTone> = {
  active: { label: "Aktif", tone: "success" },
  expiring: { label: "Hampir habis", tone: "warning" },
  expired: { label: "Berakhir", tone: "neutral" },
};

export const TICKET_STATUS: Record<TicketStatus, LabelTone> = {
  open: { label: "Open", tone: "danger" },
  in_progress: { label: "In Progress", tone: "warning" },
  completed: { label: "Completed", tone: "success" },
};

export const TICKET_CAUSE: Record<TicketCause, string> = {
  cleaning: "Cleaning",
  sensor_error: "Sensor Error",
  overheat: "Overheat",
  preventive: "Preventive",
  power_loss: "Power Loss",
  connectivity: "Konektivitas",
};

export const TICKET_PRIORITY: Record<TicketPriority, LabelTone> = {
  low: { label: "Rendah", tone: "neutral" },
  medium: { label: "Sedang", tone: "info" },
  high: { label: "Tinggi", tone: "warning" },
  critical: { label: "Kritis", tone: "danger" },
};

export const VENDOR_STATUS: Record<VendorRequestStatus, LabelTone> = {
  waiting: { label: "Menunggu", tone: "neutral" },
  in_progress: { label: "Dalam Proses", tone: "warning" },
  done: { label: "Selesai", tone: "success" },
};

export const VENDOR_SERVICE: Record<VendorServiceType, string> = {
  cleaning: "Cleaning",
  maintenance: "Maintenance",
  fuel_supply: "Pasok BBM",
  fuel_polishing: "Filtrasi BBM",
  calibration: "Kalibrasi Lab",
};

export const BUILDING_CATEGORY: Record<BuildingCategory, string> = {
  office: "Perkantoran",
  datacenter: "Data center",
  telco: "Menara telekomunikasi",
  hospital: "Rumah sakit",
  industrial: "Industri & gudang",
  education: "Pendidikan",
  retail: "Pusat belanja",
  hotel: "Perhotelan",
  residential: "Hunian",
  laboratory: "Laboratorium",
};

export const VARIANCE_LEVEL: Record<VarianceLevel, LabelTone> = {
  below: { label: "Di bawah asumsi", tone: "success" },
  normal: { label: "Sesuai asumsi", tone: "neutral" },
  deviation: { label: "Menyimpang", tone: "warning" },
  warning: { label: "Perlu evaluasi", tone: "danger" },
};
