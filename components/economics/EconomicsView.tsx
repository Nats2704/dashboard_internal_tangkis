"use client";

import { useMemo, useState } from "react";
import type { BuildingEconomicsRow } from "@/types/economics";
import { toEconomicsRow } from "@/lib/analytics/economics";
import { COST_ASSUMPTION_PER_UNIT_YEAR } from "@/lib/constants";
import { formatRupiahShort } from "@/lib/utils/format";
import { Panel, SectionHeader } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { EconomicsInsight, EconomicsSummaryStrip } from "@/components/dashboard/BuildingEconomics";
import { EconomicsChart } from "./EconomicsChart";
import { EconomicsTable } from "./EconomicsTable";

const MIN = 1_500_000;
const MAX = 3_000_000;
const STEP = 50_000;

/**
 * Simulasi asumsi: operator bisa menggeser asumsi biaya per unit untuk
 * melihat berapa gedung yang masih melenceng dan berapa kekurangannya.
 */
export function EconomicsView({ rows }: { rows: BuildingEconomicsRow[] }) {
  const [assumption, setAssumption] = useState(COST_ASSUMPTION_PER_UNIT_YEAR);
  const simulated = useMemo(
    () => rows.map((r) => toEconomicsRow(r, assumption)).sort((a, b) => b.variancePct - a.variancePct),
    [rows, assumption]
  );
  const changed = assumption !== COST_ASSUMPTION_PER_UNIT_YEAR;

  return (
    <div className="space-y-6">
      <Panel labelledBy="simulasi-title">
        <SectionHeader
          id="simulasi-title"
          title="Aktual vs asumsi"
          description="Biaya layanan per unit per tahun. Angka gedung dengan data kurang dari 12 bulan disetahunkan."
        />
        <div className="flex flex-col gap-3 border-b border-line bg-sunken px-5 py-4 md:flex-row md:items-center md:gap-6">
          <label htmlFor="assumption" className="shrink-0 text-[13px] font-medium text-ink-2">
            Simulasi asumsi Excel
          </label>
          <input
            id="assumption"
            type="range"
            min={MIN}
            max={MAX}
            step={STEP}
            value={assumption}
            onChange={(e) => setAssumption(Number(e.target.value))}
            className="w-full accent-[#0e6f66] md:max-w-sm"
            aria-valuetext={formatRupiahShort(assumption)}
          />
          <p className="shrink-0 text-[14px] font-semibold">
            {formatRupiahShort(assumption)} <span className="text-[12.5px] font-normal text-muted">per unit per tahun</span>
          </p>
          {changed ? (
            <Button size="sm" variant="ghost" onClick={() => setAssumption(COST_ASSUMPTION_PER_UNIT_YEAR)} className="md:ml-auto">
              Kembali ke {formatRupiahShort(COST_ASSUMPTION_PER_UNIT_YEAR)}
            </Button>
          ) : null}
        </div>
        <EconomicsSummaryStrip rows={simulated} />
        <div className="grid xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 border-b border-line px-5 py-5 xl:border-r xl:border-b-0">
            <EconomicsChart rows={simulated} assumption={assumption} height={320} />
          </div>
          <div className="px-5 py-5">
            <EconomicsInsight rows={simulated} />
            <p className="mt-4 text-[12.5px] leading-relaxed text-muted">
              Komponen biaya: SIM data Rp 45 rb per bulan, kunjungan teknisi (transport dan jasa), suku cadang, serta sampling
              lab dua kali setahun. Geser asumsi untuk melihat titik impas model bisnis.
            </p>
          </div>
        </div>
      </Panel>
      <Panel labelledBy="rincian-title">
        <SectionHeader id="rincian-title" title="Rincian per gedung" description="Semua angka per unit per tahun." />
        <EconomicsTable rows={simulated} detailed />
      </Panel>
    </div>
  );
}
