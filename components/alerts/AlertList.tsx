import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { AppNotification, NotificationSeverity } from "@/types/notification";
import { formatRelative } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export const SEVERITY_ORDER: NotificationSeverity[] = ["critical", "warning", "info"];

const STYLE: Record<NotificationSeverity, { label: string; text: string; bar: string }> = {
  critical: { label: "Kritis", text: "text-danger", bar: "bg-danger" },
  warning: { label: "Perhatian", text: "text-warning", bar: "bg-warning" },
  info: { label: "Info", text: "text-info", bar: "bg-info/70" },
};

export function sortBySeverity(list: AppNotification[]): AppNotification[] {
  return [...list].sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity));
}

/** Daftar alarm ringkas: garis tingkat keparahan, judul, konteks, dan waktu. */
export function AlertList({ notifications, className }: { notifications: AppNotification[]; className?: string }) {
  return (
    <ul className={cn("divide-y divide-line/70", className)}>
      {notifications.map((n) => {
        const s = STYLE[n.severity];
        return (
          <li key={n.id}>
            <Link href={n.href} className="group relative flex gap-3 py-3 pr-4 pl-5 transition-colors hover:bg-hover">
              <span className={cn("absolute top-3 bottom-3 left-0 w-[2px] rounded-full", s.bar)} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-[10.5px] font-semibold tracking-[0.1em] uppercase">
                  <span className={s.text}>{s.label}</span>
                  <span className="font-normal tracking-normal text-subtle normal-case">{formatRelative(n.createdAt)}</span>
                </p>
                <p className="mt-0.5 text-[13.5px] leading-snug font-medium text-ink">{n.title}</p>
                <p className="mt-0.5 text-[12.5px] leading-snug text-muted">{n.description}</p>
              </div>
              <ChevronRight className="mt-5 size-4 shrink-0 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-ink-2" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
