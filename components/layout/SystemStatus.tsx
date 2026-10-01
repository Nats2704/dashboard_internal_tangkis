import Link from "next/link";
import type { AppNotification } from "@/types/notification";
import { cn } from "@/lib/utils/cn";
import { PulseDot } from "@/components/ui/PulseDot";

/** Ringkasan status satu baris di header, diturunkan dari daftar alarm aktif. */
export function SystemStatus({ notifications, className }: { notifications: AppNotification[]; className?: string }) {
  const critical = notifications.filter((n) => n.severity === "critical").length;
  const warning = notifications.filter((n) => n.severity === "warning").length;

  const state =
    critical > 0
      ? { tone: "danger" as const, label: `${critical} alarm kritis`, classes: "border-danger/30 bg-danger-soft text-danger" }
      : warning > 0
        ? { tone: "warning" as const, label: "Perlu perhatian", classes: "border-warning/30 bg-warning-soft text-warning" }
        : { tone: "success" as const, label: "Semua sistem normal", classes: "border-success/30 bg-success-soft text-success" };

  return (
    <Link
      href="/alerts"
      className={cn(
        "inline-flex h-7 items-center gap-2 rounded-md border px-2.5 text-[11px] font-semibold tracking-[0.07em] whitespace-nowrap uppercase transition-colors hover:brightness-110",
        state.classes,
        className
      )}
      aria-label={`Status sistem: ${state.label}. Buka daftar alarm.`}
    >
      <PulseDot tone={state.tone} pulse={state.tone !== "success"} />
      {state.label}
    </Link>
  );
}
