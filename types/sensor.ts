export type SensorKind = "level" | "water" | "temperature";

export type SensorStatus =
  | "normal"
  | "stuck"
  | "out_of_range"
  | "calibration"
  | "no_data";

export interface Sensor {
  id: string;
  deviceId: string;
  buildingId: string;
  kind: SensorKind;
  currentReading: number | null;
  lastReading: number | null;
  labResult: number | null;
  /** Selisih bertanda terhadap hasil lab terakhir, dalam persen. */
  deviationPct: number | null;
  lastCalibration: string;
  lastLabSample: string;
  status: SensorStatus;
  /** Lama pembacaan tidak berubah (untuk status macet). */
  stuckHours: number | null;
}

export interface SensorTrendPoint {
  label: string;
  avgDeviationPct: number;
  normalPct: number;
}

export interface SensorSummary {
  total: number;
  evaluated: number;
  normal: number;
  normalPct: number;
  stuck: number;
  outOfRange: number;
  calibration: number;
  noData: number;
  avgDeviationPct: number;
  unitsNeedingCalibration: number;
}
