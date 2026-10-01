import type { Tone } from "@/lib/constants/status";
import { cn } from "@/lib/utils/cn";
import { TONE_DOT } from "./Badge";

/** Titik status dengan cincin denyut halus, dipakai untuk kondisi yang sedang berlangsung. */
export function PulseDot({
  tone,
  pulse = true,
  size = "sm",
  className,
}: {
  tone: Tone;
  pulse?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const dim = size === "md" ? "size-2.5" : "size-1.5";
  return (
    <span className={cn("relative inline-flex shrink-0", dim, className)} aria-hidden>
      {pulse ? <span className={cn("absolute inset-0 animate-pulse-ring rounded-full", TONE_DOT[tone])} /> : null}
      <span className={cn("relative rounded-full", dim, TONE_DOT[tone])} />
    </span>
  );
}
