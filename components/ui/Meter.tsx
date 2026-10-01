import type { Tone } from "@/lib/constants/status";
import { cn } from "@/lib/utils/cn";
import { TONE_DOT } from "./Badge";

/** Bar horizontal tipis untuk proporsi. */
export function Meter({
  value,
  max = 100,
  tone = "neutral",
  className,
  label,
}: {
  value: number;
  max?: number;
  tone?: Tone | "accent";
  className?: string;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-fill", className)}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-500 ease-out",
          tone === "accent" ? "bg-accent" : tone === "neutral" ? "bg-ink-2/45" : TONE_DOT[tone]
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export interface SegmentItem {
  key: string;
  label: string;
  value: number;
  className: string;
}

/** Bar bertumpuk untuk distribusi satu populasi. */
export function SegmentBar({
  segments,
  className,
  label,
}: {
  segments: SegmentItem[];
  className?: string;
  label: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  return (
    <div
      role="img"
      aria-label={label}
      className={cn("flex h-2 w-full gap-0.5 overflow-hidden rounded-full", className)}
    >
      {segments.map((segment) =>
        segment.value > 0 ? (
          <div
            key={segment.key}
            className={cn("h-full first:rounded-l-full last:rounded-r-full", segment.className)}
            style={{ width: `${(segment.value / total) * 100}%` }}
            title={`${segment.label}: ${segment.value}`}
          />
        ) : null
      )}
    </div>
  );
}
