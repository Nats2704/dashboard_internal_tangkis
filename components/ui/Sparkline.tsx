import { useId } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Garis tren mini tanpa sumbu. Hanya dipakai untuk deret waktu yang memang ada
 * di data; jangan isi dengan angka karangan.
 */
export function Sparkline({
  data,
  color = "var(--color-accent)",
  height = 32,
  className,
  label,
  area = true,
}: {
  data: number[];
  color?: string;
  height?: number;
  className?: string;
  label: string;
  area?: boolean;
}) {
  const id = useId();
  if (data.length < 2) return null;
  const width = 100;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 3;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = pad + (1 - (v - min) / range) * (height - pad * 2);
    return [x, y] as const;
  });
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const last = points[points.length - 1];

  return (
    <div className={cn("relative w-full", className)} style={{ height }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={label}
        className="absolute inset-0 h-full w-full overflow-visible"
      >
        {area ? (
          <>
            <defs>
              <linearGradient id={`${id}-fill`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.22} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <path d={`${line} L${width},${height} L0,${height} Z`} fill={`url(#${id}-fill)`} />
          </>
        ) : null}
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
      </svg>
      {/* Titik akhir di HTML supaya tetap bulat walau SVG diregangkan. */}
      <span
        aria-hidden
        className="absolute size-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-surface"
        style={{ left: `${last[0]}%`, top: last[1], backgroundColor: color }}
      />
    </div>
  );
}
