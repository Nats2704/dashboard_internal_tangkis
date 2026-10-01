/**
 * Warna untuk library yang menerima warna lewat props (Recharts, Leaflet).
 * Berupa referensi token CSS, bukan hex, supaya ikut berganti saat mode
 * gelap/terang diubah. Hanya aman dipakai di atribut SVG atau inline style;
 * jangan digabung dengan sufiks alpha (mis. `${CHART.accent}33`).
 */
export const CHART = {
  grid: "var(--color-line)",
  axisLine: "var(--color-line-strong)",
  axisText: "var(--color-subtle)",
  label: "var(--color-muted)",
  ink: "var(--color-ink)",
  surface: "var(--color-surface)",
  elevated: "var(--color-elevated)",
  accent: "var(--color-accent)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
  info: "var(--color-info)",
  neutral: "var(--color-subtle)",
  /** Batang netral yang tetap terbaca di atas surface. */
  neutralBar: "var(--color-neutral-bar)",
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
    boxShadow: "0 12px 32px var(--color-shadow)",
    padding: "8px 10px",
  },
  labelStyle: { color: CHART.label, marginBottom: 2 },
  itemStyle: { color: CHART.ink },
} as const;
