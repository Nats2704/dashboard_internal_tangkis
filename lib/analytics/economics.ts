import type {
  BuildingEconomics,
  BuildingEconomicsRow,
  EconomicsSummary,
  VarianceLevel,
} from "@/types/economics";
import {
  COST_ASSUMPTION_PER_UNIT_YEAR,
  VARIANCE_DEVIATION_PCT,
  VARIANCE_WARNING_PCT,
} from "@/lib/constants";

export function varianceLevel(variancePct: number): VarianceLevel {
  if (variancePct < -VARIANCE_DEVIATION_PCT) return "below";
  if (variancePct <= VARIANCE_DEVIATION_PCT) return "normal";
  if (variancePct <= VARIANCE_WARNING_PCT) return "deviation";
  return "warning";
}

export function toEconomicsRow(
  item: BuildingEconomics,
  assumption = COST_ASSUMPTION_PER_UNIT_YEAR
): BuildingEconomicsRow {
  const { connectivity, service, parts, calibration } = item.breakdown;
  const actualPerUnit = connectivity + service + parts + calibration;
  const variancePct = ((actualPerUnit - assumption) / assumption) * 100;
  return {
    ...item,
    actualPerUnit,
    assumptionPerUnit: assumption,
    variancePct,
    level: varianceLevel(variancePct),
    annualGap: (actualPerUnit - assumption) * item.unitCount,
  };
}

export function summarizeEconomics(rows: BuildingEconomicsRow[]): EconomicsSummary {
  const units = rows.reduce((sum, r) => sum + r.unitCount, 0);
  const weightedActual =
    rows.reduce((sum, r) => sum + r.actualPerUnit * r.unitCount, 0) /
    Math.max(1, units);
  const assumption = rows[0]?.assumptionPerUnit ?? COST_ASSUMPTION_PER_UNIT_YEAR;
  return {
    assumptionPerUnit: assumption,
    weightedActualPerUnit: weightedActual,
    weightedVariancePct: ((weightedActual - assumption) / assumption) * 100,
    buildingsOverThreshold: rows.filter(
      (r) => r.variancePct > VARIANCE_DEVIATION_PCT
    ).length,
    buildingsTotal: rows.length,
    annualGap: rows.reduce((sum, r) => sum + r.annualGap, 0),
  };
}
