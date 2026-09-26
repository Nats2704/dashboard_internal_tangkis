"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BuildingEconomicsRow, VarianceLevel } from "@/types/economics";
import { useReferenceData } from "@/components/providers/ReferenceDataProvider";
import { VARIANCE_LEVEL } from "@/lib/constants/status";
import { formatNumber, formatRupiahShort, formatSignedPercent } from "@/lib/utils/format";

/** Warna hanya untuk status: netral bila sesuai, amber menyimpang, merah perlu evaluasi. */
export const LEVEL_FILL: Record<VarianceLevel, string> = {
  below: "#9fb3ab",
  normal: "#aab2ae",
  deviation: "#d49a3a",
  warning: "#c0574b",
};

const AXIS = { fontSize: 11, fill: "#66726d" };

interface ChartDatum extends BuildingEconomicsRow {
  code: string;
  name: string;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: ChartDatum }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2.5 text-[12.5px] shadow-[0_8px_24px_rgb(10_29_25/0.12)]">
      <p className="font-medium text-ink">{d.name}</p>
      <p className="text-[11.5px] text-muted">
        {d.unitCount} unit · data {d.dataMonths} bulan
      </p>
      <dl className="mt-2 grid grid-cols-[auto_auto] gap-x-4 gap-y-0.5">
        <dt className="text-muted">Aktual</dt>
        <dd className="tabular text-right font-medium">{formatRupiahShort(d.actualPerUnit)}</dd>
        <dt className="text-muted">Asumsi</dt>
        <dd className="tabular text-right">{formatRupiahShort(d.assumptionPerUnit)}</dd>
        <dt className="text-muted">Selisih</dt>
        <dd className="tabular text-right font-medium">{formatSignedPercent(d.variancePct)}</dd>
      </dl>
      <p className="mt-1.5 text-[11.5px] text-muted">{VARIANCE_LEVEL[d.level].label}</p>
    </div>
  );
}

export function EconomicsChart({ rows, assumption, height = 280 }: { rows: BuildingEconomicsRow[]; assumption: number; height?: number }) {
  const { buildingById } = useReferenceData();
  const data: ChartDatum[] = rows.map((r) => ({
    ...r,
    code: buildingById.get(r.buildingId)?.code ?? "",
    name: buildingById.get(r.buildingId)?.name ?? "",
  }));
  const step = 500_000;
  const max = Math.ceil((Math.max(...data.map((d) => d.actualPerUnit), assumption) * 1.04) / step) * step;
  const ticks = Array.from({ length: max / step + 1 }, (_, i) => i * step);

  return (
    <div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 8, bottom: 0, left: -4 }} barCategoryGap={4}>
            <CartesianGrid vertical={false} stroke="#e8ebe6" />
            <XAxis
              dataKey="code"
              tick={{ ...AXIS, fontSize: 10.5 }}
              tickLine={false}
              axisLine={{ stroke: "#d6dbd3" }}
              interval={0}
              angle={-40}
              textAnchor="end"
              height={42}
            />
            <YAxis
              tick={AXIS}
              tickLine={false}
              axisLine={false}
              width={52}
              domain={[0, max]}
              ticks={ticks}
              tickFormatter={(v: number) => `${formatNumber(v / 1_000_000, 1)} jt`}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgb(20 33 29 / 0.04)" }} />
            <Bar dataKey="actualPerUnit" radius={[4, 4, 0, 0]} isAnimationActive={false} maxBarSize={30}>
              {data.map((d) => (
                <Cell key={d.buildingId} fill={LEVEL_FILL[d.level]} />
              ))}
            </Bar>
            <ReferenceLine
              y={assumption}
              stroke="#14211d"
              strokeWidth={1.5}
              label={{
                value: `Asumsi Excel ${formatRupiahShort(assumption)}`,
                position: "insideTopRight",
                fontSize: 11,
                fill: "#14211d",
                dy: -16,
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-muted">
        {(["normal", "deviation", "warning"] as VarianceLevel[]).map((level) => (
          <li key={level} className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm" style={{ backgroundColor: LEVEL_FILL[level] }} aria-hidden />
            {level === "normal" ? "Dalam ±10% asumsi" : level === "deviation" ? "+10% s/d +20%" : "Lebih dari +20%"}
          </li>
        ))}
        <li className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-ink" aria-hidden />
          Asumsi per unit per tahun
        </li>
      </ul>
    </div>
  );
}
