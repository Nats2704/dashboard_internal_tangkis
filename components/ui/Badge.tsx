import type { ReactNode } from "react";
import type { Tone } from "@/lib/constants/status";
import { cn } from "@/lib/utils/cn";

const DOT: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  neutral: "bg-subtle",
};

const TEXT: Record<Tone, string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-info",
  neutral: "text-muted",
};

const SOFT: Record<Tone, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  neutral: "bg-black/[0.05] text-ink-2",
};

export function StatusDot({ tone, className }: { tone: Tone; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-1.5 shrink-0 rounded-full", DOT[tone], className)}
    />
  );
}

interface BadgeProps {
  tone: Tone;
  children: ReactNode;
  /** "dot" untuk status di tabel, "soft" untuk label yang perlu lebih menonjol. */
  variant?: "dot" | "soft";
  className?: string;
}

export function Badge({ tone, children, variant = "dot", className }: BadgeProps) {
  if (variant === "soft") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded px-1.5 py-0.5 text-[12px] font-medium whitespace-nowrap",
          SOFT[tone],
          className
        )}
      >
        {children}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[13px] font-medium whitespace-nowrap",
        TEXT[tone],
        className
      )}
    >
      <StatusDot tone={tone} />
      {children}
    </span>
  );
}

export const TONE_TEXT = TEXT;
export const TONE_DOT = DOT;
