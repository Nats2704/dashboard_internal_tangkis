import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/format";
import { LOW_BATTERY_PCT, WEAK_SIGNAL_DBM } from "@/lib/constants";

/** Empat batang sinyal. Ambang mengikuti praktik umum RSSI modem seluler. */
export function signalLevel(dbm: number): number {
  if (dbm > -65) return 4;
  if (dbm > -80) return 3;
  if (dbm > WEAK_SIGNAL_DBM) return 2;
  return 1;
}

export function SignalReading({ dbm }: { dbm: number | null }) {
  if (dbm === null) return <span className="text-subtle">—</span>;
  const level = signalLevel(dbm);
  return (
    <span className="inline-flex items-center gap-2">
      <span className="flex h-3 items-end gap-[2px]" aria-hidden>
        {[1, 2, 3, 4].map((bar) => (
          <span
            key={bar}
            className={cn(
              "w-[3px] rounded-[1px]",
              bar <= level ? (level === 1 ? "bg-danger" : "bg-ink-2") : "bg-line-strong"
            )}
            style={{ height: `${bar * 3}px` }}
          />
        ))}
      </span>
      <span className={cn("tabular", level === 1 && "text-danger")}>{formatNumber(dbm)} dBm</span>
    </span>
  );
}

export function BatteryReading({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-subtle">—</span>;
  const low = pct < LOW_BATTERY_PCT;
  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative h-2 w-6 rounded-[2px] border border-line-strong p-px" aria-hidden>
        <span
          className={cn("block h-full rounded-[1px]", low ? "bg-danger" : "bg-ink-2/70")}
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className={cn("tabular", low && "text-danger")}>{pct}%</span>
    </span>
  );
}
