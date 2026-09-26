import type { BuildingEconomics } from "@/types/economics";
import { COST_ASSUMPTION_PER_UNIT_YEAR } from "@/lib/constants";
import { SNAPSHOT_MS } from "@/lib/utils/format";
import { buildingPlans } from "./buildings";
import { createRandom, roundTo, wib } from "./random";

const rng = createRandom(1900);

/**
 * Selisih biaya aktual terhadap asumsi per gedung, hasil rekap biaya
 * kunjungan, suku cadang, SIM data, dan sampling lab. Di backend nilai ini
 * dihitung dari tiket servis dan tagihan konektivitas per gedung.
 */
const OBSERVED_VARIANCE_PCT: Record<string, number> = {
  GM: 21.1,
  MTK: 4.2,
  TLA: -6.8,
  DCB: -12.4,
  DCC: -9.1,
  MTN: 31.6,
  MTB: 26.3,
  PMJ: 8.9,
  UNIV: 2.7,
  RSH: 13.8,
  RSM: 17.5,
  MSR: -3.5,
  HSK: 6.1,
  ATK: -14.2,
  STB: 38.9,
  DOP: 11.4,
  KKU: 44.7,
  SPJ: -8.3,
  WTC: 1.9,
  LBP: -4.4,
  GBC: 19.2,
  RSB: -2.1,
  POL: 24,
};

const CONNECTIVITY_PER_YEAR = 540_000; // SIM data Rp 45 rb per bulan

function monthsOfData(contractStart: string): number {
  const start = Date.parse(wib(contractStart));
  const months = Math.floor((SNAPSHOT_MS - start) / (30.44 * 86_400_000));
  return Math.max(1, Math.min(12, months));
}

function buildEconomics(): BuildingEconomics[] {
  return buildingPlans
    .filter((plan) => plan.installed > 0)
    .map((plan) => {
      const variance = OBSERVED_VARIANCE_PCT[plan.code] ?? 0;
      const actual = roundTo(COST_ASSUMPTION_PER_UNIT_YEAR * (1 + variance / 100), 1_000);
      const calibration = roundTo(rng.float(260_000, 360_000), 1_000);
      const remainder = actual - CONNECTIVITY_PER_YEAR - calibration;
      const parts = roundTo(remainder * rng.float(0.3, 0.42), 1_000);
      return {
        buildingId: plan.buildingId,
        unitCount: plan.installed,
        dataMonths: monthsOfData(plan.contractStart),
        breakdown: {
          connectivity: CONNECTIVITY_PER_YEAR,
          service: remainder - parts,
          parts,
          calibration,
        },
      };
    });
}

export const mockEconomics: BuildingEconomics[] = buildEconomics();
