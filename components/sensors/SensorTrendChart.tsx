"use client";

import { useId, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SensorTrendPoint } from "@/types/sensor";
import { Tabs } from "@/components/ui/Tabs";
import { CALIBRATION_THRESHOLD_PCT } from "@/lib/constants";
import { CHART, CHART_AXIS_TICK } from "@/lib/constants/chart";
import { formatNumber } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

type Metric = "deviation" | "normal";

function TrendTooltip({
  active,
  payload,
  label,
  metric,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  metric: Metric;
}) {
  if (!active || !payload?.length) return null;
  const value = Number(payload[0].value);
  return (
    <div className="rounded-md border border-line-strong bg-elevated px-3 py-2 text-[12.5px] shadow-[0_12px_32px_var(--color-shadow)]">
      <p className="text-[11px] text-muted">Minggu {label}</p>
      <p className="tabular mt-0.5 text-[15px] font-semibold text-ink">
        {formatNumber(value, metric === "deviation" ? 2 : 1)}%
      </p>
      <p className="text-[11px] text-muted">{metric === "deviation" ? "Selisih rata-rata vs lab" : "Sensor normal"}</p>
    </div>
  );
}

export function SensorTrendChart({ data, height = 210 }: { data: SensorTrendPoint[]; height?: number }) {
  const [metric, setMetric] = useState<Metric>("deviation");
  const gradientId = useId();
  const reduceMotion = useReducedMotion();
  const key = metric === "deviation" ? "avgDeviationPct" : "normalPct";
  const last = data[data.length - 1];
  const first = data[0];
  const delta = metric === "deviation" ? last.avgDeviationPct - first.avgDeviationPct : last.normalPct - first.normalPct;
  // Naiknya selisih atau turunnya sensor normal sama-sama memburuk.
  const worsening = metric === "deviation" ? delta > 0 : delta < 0;
  const color = metric === "deviation" ? CHART.warning : CHART.accent;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          label="Metrik tren sensor"
          value={metric}
          onChange={setMetric}
          items={[
            { value: "deviation", label: "Selisih vs lab" },
            { value: "normal", label: "Sensor normal" },
          ]}
        />
        <p className="text-[11.5px] text-subtle">12 minggu terakhir</p>
      </div>

      {/* Insight di atas grafik: angka sekarang, perubahan, dan konteksnya. */}
      <div className="mt-4 flex flex-wrap items-end gap-x-4 gap-y-1">
        <p className="tabular text-[28px] leading-8 font-semibold tracking-[-0.03em] text-ink">
          {formatNumber(metric === "deviation" ? last.avgDeviationPct : last.normalPct, 1)}
          <span className="ml-0.5 text-[14px] font-medium text-muted">%</span>
        </p>
        <p className={cn("tabular pb-1 text-[12.5px] font-medium", worsening ? "text-warning" : "text-success")}>
          {delta > 0 ? "+" : "−"}
          {formatNumber(Math.abs(delta), 1)} poin
          <span className="ml-1 font-normal text-muted">dalam 12 minggu</span>
        </p>
      </div>
      <p className="mt-1 text-[12.5px] text-muted">
        {metric === "deviation"
          ? "Rata-rata selisih pembacaan terhadap sampel lab, naik perlahan sejak kalibrasi massal awal Juli."
          : "Porsi sensor yang membaca normal dari seluruh sensor aktif."}
      </p>

      <div className="mt-3" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 18, right: 26, bottom: 0, left: -14 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={CHART.grid} strokeDasharray="2 4" />
            <XAxis
              dataKey="label"
              tick={CHART_AXIS_TICK}
              tickLine={false}
              axisLine={{ stroke: CHART.axisLine }}
              interval="preserveStartEnd"
              minTickGap={18}
            />
            <YAxis
              tick={CHART_AXIS_TICK}
              tickLine={false}
              axisLine={false}
              width={48}
              domain={metric === "deviation" ? [0, 6] : [94, 100]}
              tickFormatter={(v: number) => `${formatNumber(v, 0)}%`}
            />
            {metric === "deviation" ? (
              <ReferenceLine
                y={CALIBRATION_THRESHOLD_PCT}
                stroke={CHART.danger}
                strokeOpacity={0.7}
                strokeDasharray="4 4"
                label={{
                  value: `Ambang kalibrasi ${CALIBRATION_THRESHOLD_PCT}%`,
                  position: "insideTopRight",
                  fontSize: 10.5,
                  fill: CHART.danger,
                }}
              />
            ) : null}
            <Tooltip content={<TrendTooltip metric={metric} />} cursor={{ stroke: CHART.axisLine, strokeWidth: 1 }} />
            <Area
              key={metric}
              type="monotone"
              dataKey={key}
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 4, stroke: CHART.surface, strokeWidth: 2, fill: color }}
              isAnimationActive={!reduceMotion}
              animationDuration={900}
              animationEasing="ease-out"
            />
            {/* Anotasi titik terakhir. */}
            <ReferenceDot
              x={last.label}
              y={last[key]}
              r={4}
              fill={color}
              stroke={CHART.surface}
              strokeWidth={2}
              label={{ value: "Sekarang", position: "top", fontSize: 10.5, fill: CHART.label, offset: 10 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>Tren mingguan sensor</caption>
        <thead>
          <tr>
            <th>Minggu</th>
            <th>Selisih rata-rata</th>
            <th>Sensor normal</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p) => (
            <tr key={p.label}>
              <td>{p.label}</td>
              <td>{p.avgDeviationPct}%</td>
              <td>{p.normalPct}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
