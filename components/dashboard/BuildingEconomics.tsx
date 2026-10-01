"use client";

import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import type { BuildingEconomicsRow } from "@/types/economics";
import { summarizeEconomics } from "@/lib/analytics/economics";
import { formatPercent, formatRupiahShort, formatSignedPercent } from "@/lib/utils/format";
import { Panel, SectionHeader } from "@/components/ui/Panel";
import { Metric } from "@/components/ui/Metric";
import { useReferenceData } from "@/components/providers/ReferenceDataProvider";
import { EconomicsChart } from "@/components/economics/EconomicsChart";
import { EconomicsTable } from "@/components/economics/EconomicsTable";

export function EconomicsSummaryStrip({ rows }: { rows: BuildingEconomicsRow[] }) {
  const summary = useMemo(() => summarizeEconomics(rows), [rows]);
  return (
    <div className="grid grid-cols-2 border-b border-line lg:grid-cols-4 [&>*]:border-line [&>*]:px-5 [&>*]:py-4">
      <Metric label="Asumsi Excel" value={formatRupiahShort(summary.assumptionPerUnit)} hint="Per unit per tahun" />
      <Metric
        className="border-l"
        label="Biaya aktual rata-rata"
        value={formatRupiahShort(summary.weightedActualPerUnit)}
        tone={summary.weightedVariancePct > 10 ? "warning" : undefined}
        hint={`${formatSignedPercent(summary.weightedVariancePct)} dari asumsi, tertimbang jumlah unit`}
      />
      <Metric
        className="border-t lg:border-t-0 lg:border-l"
        label="Gedung melenceng > 10%"
        value={`${summary.buildingsOverThreshold} dari ${summary.buildingsTotal}`}
        hint="Di atas asumsi lebih dari 10%"
      />
      <Metric
        className="border-t border-l lg:border-t-0"
        label="Kekurangan biaya setahun"
        value={formatRupiahShort(summary.annualGap)}
        tone={summary.annualGap > 0 ? "danger" : "success"}
        hint="Total selisih aktual vs asumsi seluruh gedung"
      />
    </div>
  );
}

export function EconomicsInsight({ rows }: { rows: BuildingEconomicsRow[] }) {
  const { buildingById } = useReferenceData();
  const summary = summarizeEconomics(rows);
  const overs = rows.filter((r) => r.annualGap > 0).sort((a, b) => b.annualGap - a.annualGap);
  const top = overs.slice(0, 2);
  const topShare = (top.reduce((s, r) => s + r.annualGap, 0) / Math.max(1, overs.reduce((s, r) => s + r.annualGap, 0))) * 100;

  return (
    <div className="flex gap-2.5">
      <TrendingUp className="mt-0.5 size-4 shrink-0 text-danger" />
      <div className="max-w-[62ch] text-[13px] leading-relaxed text-ink-2">
        <p className="text-[14px] font-medium text-ink">Jika biaya nyata melenceng, model bisnis perlu dievaluasi.</p>
        <p className="mt-1">
          Biaya layanan rata-rata {formatSignedPercent(summary.weightedVariancePct)} di atas asumsi.{" "}
          {top.length ? (
            <>
              {top.map((r) => buildingById.get(r.buildingId)?.name).join(" dan ")} menyumbang {formatPercent(topShare, 0)} dari
              selisih karena jumlah unitnya besar dan lokasinya tersebar, sehingga biaya kunjungan membengkak.
            </>
          ) : null}
        </p>
      </div>
    </div>
  );
}

export function BuildingEconomics({ rows }: { rows: BuildingEconomicsRow[] }) {
  const assumption = rows[0]?.assumptionPerUnit ?? 0;
  const topDeviations = useMemo(() => [...rows].sort((a, b) => b.variancePct - a.variancePct).slice(0, 6), [rows]);

  return (
    <Panel id="ekonomi-gedung" labelledBy="ekonomi-gedung-title">
      <SectionHeader
        id="ekonomi-gedung-title"
        eyebrow="Model bisnis"
        title="Ekonomi nyata per gedung"
        description="Biaya layanan aktual per unit per tahun dibanding asumsi di model Excel."
        href="/economics"
        linkLabel="Lihat rincian ekonomi"
      />
      <EconomicsSummaryStrip rows={rows} />
      <div className="grid xl:grid-cols-[minmax(0,1fr)_440px]">
        <div className="min-w-0 border-b border-line px-5 py-5 xl:border-r xl:border-b-0">
          <EconomicsChart rows={rows} assumption={assumption} height={340} />
        </div>
        <div className="min-w-0">
          <div className="px-5 pt-5 pb-5">
            <EconomicsInsight rows={rows} />
          </div>
          <h3 className="border-t border-line px-5 pt-4 pb-1 text-[13px] font-semibold text-ink">Selisih terbesar</h3>
          <EconomicsTable rows={topDeviations} />
        </div>
      </div>
    </Panel>
  );
}
