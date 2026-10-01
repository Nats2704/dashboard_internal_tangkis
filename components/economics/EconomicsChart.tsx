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
import { CHART, CHART_AXIS_TICK } from "@/lib/constants/chart";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/** Warna hanya untuk status: netral bila sesuai, amber menyimpang, merah perlu evaluasi. */
export const LEVEL_FILL: Record<VarianceLevel, string> = {
  below: CHART.neutralBar,
  normal: CHART.neutralBar,
  deviation: CHART.warning,
  warning: CHART.danger,
};

const AXIS = CHART_AXIS_TICK;

interface ChartDatum extends BuildingEconomicsRow {
  code: string;
  name: string;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: ChartDatum }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-md border border-line-strong bg-elevated px-3 py-2.5 text-[12.5px] shadow-[0_12px_32px_var(--color-shadow)]">
      <p className="font-medium text-ink">{d.name}</p>
      <p className="text-[12px] text-muted">
        {d.unitCount} unit · data {d.dataMonths} bulan
      </p>
      <dl className="mt-2 grid grid-cols-[auto_auto] gap-x-4 gap-y-0.5">
        <dt className="text-muted">Aktual</dt>
        <dd className="tabular text-right font-medium text-ink">{formatRupiahShort(d.actualPerUnit)}</dd>
        <dt className="text-muted">Asumsi</dt>
        <dd className="tabular text-right text-ink-2">{formatRupiahShort(d.assumptionPerUnit)}</dd>
        <dt className="text-muted">Selisih</dt>
        <dd className="tabular text-right font-medium text-ink">{formatSignedPercent(d.variancePct)}</dd>
      </dl>
      <p className="mt-1.5 text-[12px] text-muted">{VARIANCE_LEVEL[d.level].label}</p>
    </div>
  );
}

export function EconomicsChart({ rows, assumption, height = 280 }: { rows: BuildingEconomicsRow[]; assumption: number; height?: number }) {
  const { buildingById } = useReferenceData();
  const reduceMotion = useReducedMotion();
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
            <CartesianGrid vertical={false} stroke={CHART.grid} strokeDasharray="2 4" />
            <XAxis
              dataKey="code"
              tick={{ ...AXIS, fontSize: 10.5 }}
              tickLine={false}
              axisLine={{ stroke: CHART.axisLine }}
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
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--color-hover)" }} />
            <Bar
              dataKey="actualPerUnit"
              radius={[3, 3, 0, 0]}
              isAnimationActive={!reduceMotion}
              animationDuration={800}
              animationEasing="ease-out"
              maxBarSize={30}
            >
              {data.map((d) => (
                <Cell key={d.buildingId} fill={LEVEL_FILL[d.level]} />
              ))}
            </Bar>
            <ReferenceLine
              y={assumption}
              stroke={CHART.accent}
              strokeWidth={1.5}
              strokeDasharray="5 4"
              label={{
                value: `Asumsi Excel ${formatRupiahShort(assumption)}`,
                position: "insideTopRight",
                fontSize: 11,
                fill: CHART.accent,
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
          <span className="h-0 w-4 border-t-[1.5px] border-dashed border-accent" aria-hidden />
          Asumsi per unit per tahun
        </li>
      </ul>
    </div>
  );
}
