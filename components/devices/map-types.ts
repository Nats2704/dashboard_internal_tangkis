import { CHART } from "@/lib/constants/chart";
import type { ConnectivityStatus, Device } from "@/types/device";
import type { Building } from "@/types/building";

export type MapFilter = "all" | ConnectivityStatus;

export interface SiteMarker {
  building: Building;
  counts: Record<ConnectivityStatus, number>;
  /** Status terburuk di gedung, menentukan warna marker. */
  status: ConnectivityStatus;
  flagged: Device[];
  sample: Device | null;
  total: number;
}

export const MARKER_COLOR: Record<ConnectivityStatus, string> = {
  online: CHART.success,
  offline: CHART.danger,
  maintenance: CHART.warning,
};

export const REGIONS = {
  jabodetabek: { label: "Jabodetabek", bounds: [[-6.62, 106.58], [-6.1, 107.2]] as [[number, number], [number, number]] },
  bandung: { label: "Bandung Raya", bounds: [[-6.95, 107.5], [-6.85, 107.66]] as [[number, number], [number, number]] },
} as const;

export type RegionKey = keyof typeof REGIONS;
