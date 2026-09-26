export type VendorRequestStatus = "waiting" | "in_progress" | "done";

export type VendorServiceType =
  | "cleaning"
  | "maintenance"
  | "fuel_supply"
  | "fuel_polishing"
  | "calibration";

export interface Vendor {
  id: string;
  name: string;
  service: VendorServiceType;
  city: string;
  contact: string;
}

export interface VendorRequest {
  id: string;
  service: VendorServiceType;
  deviceId: string;
  buildingId: string;
  vendorId: string;
  status: VendorRequestStatus;
  jobValue: number;
  commission: number;
  requestedAt: string;
  completedAt: string | null;
  note: string;
}

export interface VendorSummary {
  total: number;
  waiting: number;
  inProgress: number;
  done: number;
  commissionEarned: number;
  commissionPipeline: number;
}
