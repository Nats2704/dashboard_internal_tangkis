import type { AppNotification } from "@/types/notification";
import { PulseDot } from "@/components/ui/PulseDot";

/** Satu baris status di atas sapaan: menjawab "apakah semuanya aman?" sebelum apa pun. */
export function StatusLine({ notifications }: { notifications: AppNotification[] }) {
  const critical = notifications.filter((n) => n.severity === "critical").length;
  const warning = notifications.filter((n) => n.severity === "warning").length;

  if (critical > 0) {
    return (
      <p className="inline-flex items-center gap-2 text-[11.5px] font-semibold tracking-[0.08em] text-danger uppercase">
        <PulseDot tone="danger" />
        {critical} alarm kritis aktif
        <span className="font-normal tracking-normal text-muted normal-case">· {warning} perlu perhatian</span>
      </p>
    );
  }
  return (
    <p className="inline-flex items-center gap-2 text-[11.5px] font-semibold tracking-[0.08em] text-success uppercase">
      <PulseDot tone="success" pulse={false} />
      Semua sistem normal
    </p>
  );
}
