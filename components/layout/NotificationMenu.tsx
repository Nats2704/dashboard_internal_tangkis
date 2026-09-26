"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell } from "lucide-react";
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

export function NotificationMenu({ notifications }: { notifications: AppNotification[] }) {
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const unread = notifications.filter((n) => !readIds.has(n.id)).length;

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
            "relative rounded-md p-2 text-ink-2 hover:bg-black/[0.05] hover:text-ink",
            open && "bg-black/[0.05] text-ink"
          )}
        >
          <Bell className="size-[18px]" />
          {unread > 0 ? (
            <span className="tabular absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
              {unread}
            </span>
          ) : null}
        </button>
      )}
    >
      {(close) => (
        <div>
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-[14px] font-semibold">Notifikasi</p>
            <button
              type="button"
              disabled={unread === 0}
              onClick={() => setReadIds(new Set(notifications.map((n) => n.id)))}
              className="text-[13px] font-medium text-accent hover:underline disabled:text-subtle disabled:no-underline"
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
                    className="flex gap-3 px-4 py-3 hover:bg-sunken"
                  >
                    <StatusDot tone={SEVERITY_TONE[n.severity]} className="mt-1.5" />
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-[13px] leading-snug", isRead ? "text-ink-2" : "font-medium text-ink")}>
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-[13px] leading-snug text-muted">{n.description}</p>
                      <p className="mt-1 text-[12px] text-subtle">{formatRelative(n.createdAt)}</p>
                    </div>
                    {!isRead ? <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" aria-label="Belum dibaca" /> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Dropdown>
  );
}
