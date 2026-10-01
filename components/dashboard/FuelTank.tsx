import { useEffect, useId, useRef, useState } from "react";
import { formatNumber } from "@/lib/utils/format";

/**
 * Tangki BBM bergaya: tinggi cairan mengikuti level sensor, permukaannya
 * bergelombang dan sedikit berayun supaya terasa hidup.
 *
 * Ukurannya mengikuti kotak induk (diukur dengan ResizeObserver) dan viewBox
 * disamakan dengan ukuran itu, jadi tangki memanjang tanpa ikut memperbesar
 * teks dan garis skala. Induk wajib punya lebar dan tinggi.
 */
export function FuelTank({ level, label }: { level: number | null; label: string }) {
  const id = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  // Ukuran awal dipakai saat render server dan sebelum pengukuran pertama.
  const [size, setSize] = useState({ width: 150, height: 260 });

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setSize({ width: Math.round(width), height: Math.round(height) });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { width, height } = size;
  const inset = 8;
  const innerW = width - inset * 2;
  const innerH = height - inset * 2;
  const pct = level === null ? 0 : Math.max(0, Math.min(100, level));
  const surface = inset + innerH * (1 - pct / 100);
  // Satu periode gelombang = setengah lebar. Path dibuat dua kali lebar tangki
  // dan digeser -50% (satu periode) berulang, jadi sambungannya mulus.
  const wave = (amp: number, y: number, closed = true) => {
    const seg = width / 4;
    let d = `M0,${y}`;
    for (let x = 0; x < width * 2; x += seg) {
      const up = Math.round(x / seg) % 2 === 0;
      d += ` Q${x + seg / 2},${y + (up ? -amp : amp)} ${x + seg},${y}`;
    }
    return closed ? `${d} L${width * 2},${height} L0,${height} Z` : d;
  };

  return (
    <div ref={boxRef} className="relative h-full w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label={label}
        className="absolute inset-0"
      >
        <defs>
          <clipPath id={`${id}-clip`}>
            <rect x={inset} y={inset} width={innerW} height={innerH} rx={12} />
          </clipPath>
          <linearGradient id={`${id}-fuel`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.6} />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0.14} />
          </linearGradient>
          <linearGradient id={`${id}-glass`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.05} />
            <stop offset="35%" stopColor="#ffffff" stopOpacity={0} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity={0.03} />
          </linearGradient>
        </defs>

        {/* Badan tangki */}
        <rect x={inset} y={inset} width={innerW} height={innerH} rx={12} fill="var(--color-sunken)" />
        <g clipPath={`url(#${id}-clip)`}>
          {level !== null ? (
            <g className="fuel-bob">
              {/* Lapisan belakang: lebih tinggi, lebih lambat, arah berlawanan. */}
              <g className="fuel-wave fuel-wave--back">
                <path d={wave(7, surface - 3)} fill="var(--color-accent)" fillOpacity={0.2} />
              </g>
              <g className="fuel-wave fuel-wave--front">
                <path d={wave(5, surface)} fill={`url(#${id}-fuel)`} />
                <path d={wave(5, surface, false)} fill="none" stroke="var(--color-accent)" strokeOpacity={0.75} strokeWidth={1.5} />
              </g>
            </g>
          ) : null}
          <rect x={inset} y={inset} width={innerW} height={innerH} fill={`url(#${id}-glass)`} />
        </g>
        <rect x={inset} y={inset} width={innerW} height={innerH} rx={12} fill="none" stroke="var(--color-line-strong)" strokeWidth={1.5} />

        {/* Skala 25/50/75 */}
        {[25, 50, 75].map((mark) => {
          const y = inset + innerH * (1 - mark / 100);
          return (
            <g key={mark}>
              <line x1={width - inset - 12} x2={width - inset} y1={y} y2={y} stroke="var(--color-line-strong)" strokeWidth={1} />
              <text x={width - inset - 15} y={y + 3.5} textAnchor="end" fontSize={10} fill="var(--color-subtle)" className="tabular">
                {mark}
              </text>
            </g>
          );
        })}

        <text x={inset + 14} y={inset + 30} fontSize={26} fontWeight={600} fill="var(--color-ink)" className="tabular" letterSpacing="-0.6">
          {level === null ? "—" : `${formatNumber(level, 0)}%`}
        </text>
        <text x={inset + 14} y={inset + 46} fontSize={10} fill="var(--color-muted)" letterSpacing="0.6">
          LEVEL BBM
        </text>
      </svg>
    </div>
  );
}
