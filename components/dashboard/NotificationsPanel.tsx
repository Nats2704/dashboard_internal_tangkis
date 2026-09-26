import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { AppNotification, NotificationSeverity } from "@/types/notification";
import { StatusDot } from "@/components/ui/Badge";
import type { Tone } from "@/lib/constants/status";
import { formatRelative } from "@/lib/utils/format";

const TONE: Record<NotificationSeverity, Tone> = { critical: "danger", warning: "warning", info: "info" };
const LABEL: Record<NotificationSeverity, string> = { critical: "Kritis", warning: "Perhatian", info: "Info" };

/** Daftar "Perlu tindakan" yang diurutkan berdasarkan tingkat keparahan. */
export function NotificationsPanel({ notifications }: { notifications: AppNotification[] }) {
  const order: NotificationSeverity[] = ["critical", "warning", "info"];
  const sorted = [...notifications].sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));
  const critical = notifications.filter((n) => n.severity === "critical").length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-baseline justify-between px-5 pt-4 pb-3">
        <h3 className="font-heading text-[17px] leading-7 font-bold tracking-[-0.01em] text-ink">Perlu tindakan</h3>
        <span className="tabular text-[12px] text-muted">
          {critical} kritis · {notifications.length} total
        </span>
      </div>
      <ul className="flex-1 border-t border-line">
        {sorted.map((n) => (
          <li key={n.id} className="border-b border-line/70 last:border-b-0">
            <Link href={n.href} className="group flex gap-3 px-5 py-3.5 hover:bg-sunken">
              <StatusDot tone={TONE[n.severity]} className="mt-[7px]" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] leading-snug font-medium text-ink">{n.title}</p>
                <p className="mt-0.5 text-[13px] leading-snug text-muted">{n.description}</p>
                <p className="mt-1 text-[12px] text-subtle">
                  {LABEL[n.severity]} · {formatRelative(n.createdAt)}
                </p>
              </div>
              <ChevronRight className="mt-1 size-4 shrink-0 text-line-strong group-hover:text-ink-2" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
