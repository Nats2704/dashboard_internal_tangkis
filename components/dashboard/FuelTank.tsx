import { useId } from "react";
import { formatNumber } from "@/lib/utils/format";

/**
 * Tangki BBM bergaya: tinggi cairan mengikuti level sensor, permukaannya
 * bergelombang sangat pelan supaya terasa hidup tanpa mengganggu.
 */
export function FuelTank({ level, label }: { level: number | null; label: string }) {
  const id = useId();
  const width = 132;
  const height = 196;
  const inset = 8;
  const innerH = height - inset * 2;
  const pct = level === null ? 0 : Math.max(0, Math.min(100, level));
  const surface = inset + innerH * (1 - pct / 100);
  // Gelombang dua periode: digeser -50% berulang, jadi sambungannya mulus.
  const wave = (amp: number, y: number) => {
    const w = width * 2;
    let d = `M0,${y}`;
    for (let x = 0; x <= w; x += width / 4) {
      const up = (x / (width / 4)) % 2 === 0;
      d += ` Q${x + width / 8},${y + (up ? -amp : amp)} ${x + width / 4},${y}`;
    }
    return `${d} L${w},${height} L0,${height} Z`;
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img" aria-label={label} className="shrink-0">
      <defs>
        <clipPath id={`${id}-clip`}>
          <rect x={inset} y={inset} width={width - inset * 2} height={innerH} rx={10} />
        </clipPath>
        <linearGradient id={`${id}-fuel`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.55} />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0.12} />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.05} />
          <stop offset="35%" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity={0.03} />
        </linearGradient>
      </defs>

      {/* Badan tangki */}
      <rect x={inset} y={inset} width={width - inset * 2} height={innerH} rx={10} fill="var(--color-sunken)" />
      <g clipPath={`url(#${id}-clip)`}>
        {level !== null ? (
          <>
            <g className="animate-wave-slow" style={{ transformBox: "view-box" }}>
              <path d={wave(2.5, surface + 2)} fill="var(--color-accent)" fillOpacity={0.12} />
            </g>
            <g className="animate-wave">
              <path d={wave(2, surface)} fill={`url(#${id}-fuel)`} />
            </g>
            <line x1={inset} x2={width - inset} y1={surface} y2={surface} stroke="var(--color-accent)" strokeOpacity={0.5} strokeWidth={1} />
          </>
        ) : null}
        <rect x={inset} y={inset} width={width - inset * 2} height={innerH} fill={`url(#${id}-glass)`} />
      </g>
      <rect x={inset} y={inset} width={width - inset * 2} height={innerH} rx={10} fill="none" stroke="var(--color-line-strong)" strokeWidth={1.5} />

      {/* Skala 25/50/75 */}
      {[25, 50, 75].map((mark) => {
        const y = inset + innerH * (1 - mark / 100);
        return (
          <g key={mark}>
            <line x1={width - inset - 12} x2={width - inset} y1={y} y2={y} stroke="var(--color-line-strong)" strokeWidth={1} />
            <text x={width - inset - 15} y={y + 3.5} textAnchor="end" fontSize={9} fill="var(--color-subtle)" className="tabular">
              {mark}
            </text>
          </g>
        );
      })}

      <text x={inset + 12} y={inset + 24} fontSize={20} fontWeight={600} fill="var(--color-ink)" className="tabular" letterSpacing="-0.5">
        {level === null ? "—" : `${formatNumber(level, 0)}%`}
      </text>
      <text x={inset + 12} y={inset + 38} fontSize={9.5} fill="var(--color-muted)" letterSpacing="0.6">
        LEVEL BBM
      </text>
    </svg>
  );
}
