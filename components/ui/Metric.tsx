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

const VALUE_SIZE = {
  lg: "text-[28px] leading-8",
  md: "text-[22px] leading-7",
  sm: "text-lg leading-6",
};

export function Metric({ label, value, unit, hint, tone, size = "md", className }: MetricProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-[12.5px] text-muted">{label}</p>
      <p
        className={cn(
          "mt-1 font-semibold tracking-tight",
          VALUE_SIZE[size],
          tone && tone !== "neutral" ? TONE_TEXT[tone] : "text-ink"
        )}
      >
        {value}
        {unit ? <span className="ml-1 text-[13px] font-medium text-muted">{unit}</span> : null}
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
