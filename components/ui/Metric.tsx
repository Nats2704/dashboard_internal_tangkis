import type { ReactNode } from "react";
import type { Tone } from "@/lib/constants/status";
import { cn } from "@/lib/utils/cn";
import { TONE_TEXT } from "./Badge";

interface MetricProps {
  label: string;
  value: ReactNode;
  unit?: string;
  hint?: ReactNode;
  tone?: Tone;
  size?: "lg" | "md" | "sm";
  className?: string;
}

// Angka telemetri adalah fokus: besar dan rapat, satuan kecil dan redup.
const VALUE_SIZE = {
  lg: "text-[30px] leading-9",
  md: "text-[22px] leading-7",
  sm: "text-[17px] leading-6",
};

export function Metric({ label, value, unit, hint, tone, size = "md", className }: MetricProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-[12px] text-muted">{label}</p>
      <p
        className={cn(
          "tabular mt-1 font-semibold tracking-[-0.025em]",
          VALUE_SIZE[size],
          tone && tone !== "neutral" ? TONE_TEXT[tone] : "text-ink"
        )}
      >
        {value}
        {unit ? <span className="ml-1 text-[12px] font-medium tracking-normal text-muted">{unit}</span> : null}
      </p>
      {hint ? <p className="mt-1 text-[12px] leading-snug text-muted">{hint}</p> : null}
    </div>
  );
}

/** Deretan metrik dalam satu komposisi, dipisah garis vertikal. */
export function MetricStrip({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid divide-line sm:divide-x [&>*]:px-5 [&>*]:py-4",
        className
      )}
    >
      {children}
    </div>
  );
}
