"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SensorTrendPoint } from "@/types/sensor";
import { Tabs } from "@/components/ui/Tabs";
import { CALIBRATION_THRESHOLD_PCT } from "@/lib/constants";
import { formatNumber } from "@/lib/utils/format";

type Metric = "deviation" | "normal";

const AXIS = { fontSize: 11.5, fill: "#66726d" };

export function SensorTrendChart({ data }: { data: SensorTrendPoint[] }) {
  const [metric, setMetric] = useState<Metric>("deviation");
  const key = metric === "deviation" ? "avgDeviationPct" : "normalPct";
  const last = data[data.length - 1];
  const first = data[0];

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
        <p className="text-[12px] text-muted">12 minggu terakhir</p>
      </div>
      <p className="mt-3 text-[13px] text-ink-2">
        {metric === "deviation" ? (
          <>
            Rata-rata selisih naik dari {formatNumber(first.avgDeviationPct, 1)}% ke{" "}
            <span className="font-semibold text-ink">{formatNumber(last.avgDeviationPct, 1)}%</span> sejak kalibrasi massal awal Juli.
          </>
        ) : (
          <>
            Porsi sensor normal turun dari {formatNumber(first.normalPct, 1)}% ke{" "}
            <span className="font-semibold text-ink">{formatNumber(last.normalPct, 1)}%</span>.
          </>
        )}
      </p>
      <div className="mt-3 h-[210px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: -12 }}>
            <CartesianGrid vertical={false} stroke="#e8ebe6" />
            <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={{ stroke: "#d6dbd3" }} interval="preserveStartEnd" minTickGap={16} />
            <YAxis
              tick={AXIS}
              tickLine={false}
              axisLine={false}
              width={48}
              domain={metric === "deviation" ? [0, 6] : [94, 100]}
              tickFormatter={(v: number) => `${formatNumber(v, 0)}%`}
            />
            {metric === "deviation" ? (
              <ReferenceLine
                y={CALIBRATION_THRESHOLD_PCT}
                stroke="#a8650a"
                strokeWidth={1}
                label={{ value: "Ambang kalibrasi 5%", position: "insideTopRight", fontSize: 11, fill: "#a8650a" }}
              />
            ) : null}
            <Tooltip
              cursor={{ stroke: "#cdd3cb", strokeWidth: 1 }}
              contentStyle={{ borderRadius: 8, border: "1px solid #e3e6e0", fontSize: 12.5, boxShadow: "0 8px 24px rgb(10 29 25 / 0.1)" }}
              labelStyle={{ color: "#66726d", marginBottom: 2 }}
              formatter={(value) => [`${formatNumber(Number(value), metric === "deviation" ? 2 : 1)}%`, metric === "deviation" ? "Selisih rata-rata" : "Sensor normal"]}
              labelFormatter={(label) => `Minggu ${label}`}
            />
            <Line
              type="monotone"
              dataKey={key}
              stroke="#0e6f66"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: "#ffffff", strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
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
