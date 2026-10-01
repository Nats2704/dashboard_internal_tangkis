/**
 * Warna untuk library yang menerima warna lewat props (Recharts, Leaflet).
 * Nilainya sama dengan token di app/globals.css; ubah keduanya bersamaan.
 */
export const CHART = {
  grid: "#1e2731",
  axisLine: "#2b3643",
  axisText: "#66727f",
  label: "#8794a4",
  ink: "#e8edf3",
  surface: "#111820",
  elevated: "#172029",
  accent: "#35c4ad",
  success: "#3fbf7f",
  warning: "#e9a23b",
  danger: "#f0604f",
  info: "#62a0f0",
  neutral: "#66727f",
  /** Batang netral yang tetap terbaca di atas surface. */
  neutralBar: "#4f5d6c",
} as const;

export const CHART_AXIS_TICK = { fontSize: 11, fill: CHART.axisText };

/** Tooltip Recharts bawaan, diselaraskan dengan lapisan elevated. */
export const CHART_TOOLTIP = {
  contentStyle: {
    background: CHART.elevated,
    border: `1px solid ${CHART.axisLine}`,
    borderRadius: 6,
    fontSize: 12.5,
    color: CHART.ink,
    boxShadow: "0 12px 32px rgb(0 0 0 / 0.45)",
    padding: "8px 10px",
  },
  labelStyle: { color: CHART.label, marginBottom: 2 },
  itemStyle: { color: CHART.ink },
} as const;
