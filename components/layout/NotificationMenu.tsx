"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Bell } from "lucide-react";
import type { AppNotification, NotificationSeverity } from "@/types/notification";
import { Dropdown } from "@/components/ui/Dropdown";
import { StatusDot } from "@/components/ui/Badge";
import { formatRelative } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { Tone } from "@/lib/constants/status";

const SEVERITY_TONE: Record<NotificationSeverity, Tone> = {
  critical: "danger",
  warning: "warning",
  info: "info",
};

const SEVERITY_LABEL: Record<NotificationSeverity, string> = {
  critical: "Kritis",
  warning: "Perhatian",
  info: "Info",
};

export function NotificationMenu({ notifications }: { notifications: AppNotification[] }) {
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const unread = notifications.filter((n) => !readIds.has(n.id)).length;
  const unreadCritical = notifications.some((n) => n.severity === "critical" && !readIds.has(n.id));

  return (
    <Dropdown
      panelClassName="w-[min(380px,calc(100vw-1.5rem))] -right-12 sm:right-0"
      trigger={({ open, toggle, id }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls={id}
          aria-label={`Notifikasi, ${unread} belum dibaca`}
          className={cn(
            "relative rounded-md p-2 text-ink-2 transition-colors hover:bg-hover hover:text-ink",
            open && "bg-hover text-ink"
          )}
        >
          <Bell className="size-[18px]" strokeWidth={1.75} />
          {unread > 0 ? (
            // key mengikuti jumlah: badge "meletup" kecil setiap kali angkanya berubah.
            <span
              key={unread}
              className={cn(
                "tabular absolute top-1 right-1 flex h-4 min-w-4 animate-badge-pop items-center justify-center rounded-full px-1 text-[10px] font-semibold ring-2 ring-canvas",
                unreadCritical ? "bg-danger text-white" : "bg-warning text-on-accent"
              )}
            >
              {unread}
            </span>
          ) : null}
        </button>
      )}
    >
      {(close) => (
        <div>
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-[13.5px] font-semibold text-ink">Notifikasi</p>
            <button
              type="button"
              disabled={unread === 0}
              onClick={() => setReadIds(new Set(notifications.map((n) => n.id)))}
              className="rounded text-[12.5px] font-medium text-accent hover:underline disabled:text-subtle disabled:no-underline"
            >
              Tandai semua dibaca
            </button>
          </div>
          <ul className="scrollbar-thin max-h-[420px] overflow-y-auto">
            {notifications.map((n) => {
              const isRead = readIds.has(n.id);
              return (
                <li key={n.id} className="border-b border-line/70 last:border-b-0">
                  <Link
                    href={n.href}
                    onClick={() => {
                      setReadIds((set) => new Set(set).add(n.id));
                      close();
                    }}
                    className="flex gap-3 px-4 py-3 transition-colors hover:bg-hover"
                  >
                    <StatusDot tone={SEVERITY_TONE[n.severity]} className="mt-1.5" />
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-[13px] leading-snug", isRead ? "text-muted" : "font-medium text-ink")}>
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-[12.5px] leading-snug text-muted">{n.description}</p>
                      <p className="mt-1 text-[11.5px] text-subtle">
                        {SEVERITY_LABEL[n.severity]} · {formatRelative(n.createdAt)}
                      </p>
                    </div>
                    {!isRead ? <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" aria-label="Belum dibaca" /> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href="/alerts"
            onClick={close}
            className="group flex items-center justify-center gap-1.5 border-t border-line px-4 py-2.5 text-[12.5px] font-medium text-accent hover:bg-hover"
          >
            Buka semua alarm
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      )}
    </Dropdown>
  );
}
