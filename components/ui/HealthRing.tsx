import type { ReactNode } from "react";
import type { Tone } from "@/lib/constants/status";
import { TONE_COLOR } from "./Badge";

// Math.sin/cos boleh beda di digit terakhir antara Node (SSR) dan browser,
// yang bikin hydration mismatch. Bulatkan supaya atribut SVG-nya identik.
const round = (n: number) => Math.round(n * 1000) / 1000;

export interface RingSegment {
  key: string;
  label: string;
  value: number;
  tone: Tone;
}

/**
 * Cincin bersegmen untuk komposisi satu populasi (sehat / perhatian / kritis).
 * Segmen dipisah celah kecil supaya tetap terbaca tanpa mengandalkan warna saja;
 * cincin "menyapu" masuk sekali saat muncul.
 */
export function HealthRing({
  segments,
  size = 196,
  thickness = 12,
  label,
  children,
}: {
  segments: RingSegment[];
  size?: number;
  thickness?: number;
  label: string;
  children?: ReactNode;
}) {
  const r = (size - thickness) / 2 - 6;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const visible = segments.filter((s) => s.value > 0);
  const gap = visible.length > 1 ? 3 : 0;
  // Segmen kecil tetap terlihat minimal 1.5% keliling.
  const minLen = c * 0.015;

  const lengths = visible.map((s) => Math.max(minLen, (s.value / total) * c) - gap);
  const arcs = visible.map((s, i) => ({
    ...s,
    len: Math.max(0, lengths[i]),
    start: lengths.slice(0, i).reduce((sum, len) => sum + len + gap, 0),
  }));

  // Tanda skala halus di luar cincin, setiap 2,5%.
  const ticks = Array.from({ length: 40 }, (_, i) => i);
  const tickR = r + thickness / 2 + 4;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label={label} className="-rotate-90">
        <g aria-hidden>
          {ticks.map((i) => {
            const a = (i / ticks.length) * Math.PI * 2;
            const major = i % 10 === 0;
            const x1 = round(size / 2 + Math.cos(a) * tickR);
            const y1 = round(size / 2 + Math.sin(a) * tickR);
            const x2 = round(size / 2 + Math.cos(a) * (tickR + (major ? 5 : 3)));
            const y2 = round(size / 2 + Math.sin(a) * (tickR + (major ? 5 : 3)));
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="var(--color-line-strong)"
                strokeWidth={major ? 1.25 : 1}
              />
            );
          })}
        </g>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-fill)" strokeWidth={thickness} />
        <g className="health-ring-sweep" style={{ ["--ring-c" as string]: `${c}` }}>
          {arcs.map((a) => (
            <circle
              key={a.key}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={TONE_COLOR[a.tone]}
              strokeWidth={thickness}
              strokeDasharray={`${a.len} ${c - a.len}`}
              strokeDashoffset={-a.start}
              strokeLinecap="butt"
            />
          ))}
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}
