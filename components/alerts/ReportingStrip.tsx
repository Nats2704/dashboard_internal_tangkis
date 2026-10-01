import { REPORT_INTERVAL_MINUTES } from "@/lib/constants";
import { SNAPSHOT_MS, formatTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

/**
 * Jendela laporan 24 jam terakhir, satu batang per interval kirim data.
 * Batang setelah waktu data terakhir ditandai hilang, jadi operator langsung
 * melihat kapan unit berhenti melapor.
 */
export function ReportingStrip({ lastSeen, className }: { lastSeen: string | null; className?: string }) {
  const slots = (24 * 60) / REPORT_INTERVAL_MINUTES;
  const slotMs = REPORT_INTERVAL_MINUTES * 60_000;
  const start = SNAPSHOT_MS - 24 * 3_600_000;
  const last = lastSeen ? Date.parse(lastSeen) : -Infinity;
  const received = Array.from({ length: slots }, (_, i) => start + (i + 1) * slotMs <= last + slotMs / 2);
  const missed = received.filter((r) => !r).length;

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[11.5px]">
        <span className="text-muted">Laporan per {REPORT_INTERVAL_MINUTES} menit · 24 jam</span>
        <span className="tabular text-danger">{missed} laporan hilang</span>
      </div>
      <div className="flex h-5 items-stretch gap-px" role="img" aria-label={`${slots - missed} dari ${slots} laporan diterima dalam 24 jam`}>
        {received.map((ok, i) => (
          <span
            key={i}
            className={cn("flex-1 rounded-[1px]", ok ? "bg-accent/35" : "bg-danger/80")}
            style={!ok ? { opacity: 0.55 + 0.45 * ((i - (slots - missed)) / Math.max(1, missed)) } : undefined}
          />
        ))}
      </div>
      <div className="tabular mt-1 flex justify-between text-[10.5px] text-subtle">
        <span>{formatTime(new Date(start).toISOString())}</span>
        {lastSeen ? <span className="text-danger/90">berhenti {formatTime(lastSeen)}</span> : null}
        <span>{formatTime(new Date(SNAPSHOT_MS).toISOString())}</span>
      </div>
    </div>
  );
}
