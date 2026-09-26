export interface CostBreakdown {
  connectivity: number;
  service: number;
  parts: number;
  calibration: number;
}

export interface BuildingEconomics {
  buildingId: string;
  unitCount: number;
  /** Jumlah bulan data aktual yang disetahunkan. */
  dataMonths: number;
  /** Biaya aktual per unit per tahun (disetahunkan), dalam rupiah. */
  breakdown: CostBreakdown;
}

export type VarianceLevel = "below" | "normal" | "deviation" | "warning";

export interface BuildingEconomicsRow extends BuildingEconomics {
  actualPerUnit: number;
  assumptionPerUnit: number;
  variancePct: number;
  level: VarianceLevel;
  annualGap: number;
}

export interface EconomicsSummary {
  assumptionPerUnit: number;
  weightedActualPerUnit: number;
  weightedVariancePct: number;
  buildingsOverThreshold: number;
  buildingsTotal: number;
  annualGap: number;
}
