"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { InventoryRecord } from "@/types/inventory";
import type { VendorRequest } from "@/types/vendor";
import { useFleet } from "@/components/providers/FleetProvider";
import { useReferenceData } from "@/components/providers/ReferenceDataProvider";
import { useTickets } from "@/components/providers/TicketProvider";
import { buildActivityFeed, type ActivityEvent } from "@/lib/analytics/activity";
import { formatDate, formatTime, SNAPSHOT_MS } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Panel, SectionHeader } from "@/components/ui/Panel";
import { TONE_DOT } from "@/components/ui/Badge";

function dayLabel(iso: string): string {
  const day = formatDate(iso);
  const today = formatDate(new Date(SNAPSHOT_MS).toISOString());
  const yesterday = formatDate(new Date(SNAPSHOT_MS - 86_400_000).toISOString());
  if (day === today) return `Hari ini · ${day}`;
  if (day === yesterday) return `Kemarin · ${day}`;
  return day;
}

/** Aliran kejadian operasional sebagai timeline, dikelompokkan per hari. */
export function ActivityTimeline({
  vendorRequests,
  inventory,
  limit = 10,
  className,
}: {
  vendorRequests: VendorRequest[];
  inventory: InventoryRecord[];
  limit?: number;
  className?: string;
}) {
  const { devices } = useFleet();
  const { tickets } = useTickets();
  const { buildingById, vendorById } = useReferenceData();

  const events = useMemo(
    () =>
      buildActivityFeed({
        devices,
        tickets,
        vendorRequests,
        inventory,
        limit,
        buildingName: (id) => (id ? buildingById.get(id)?.name ?? "—" : "Gudang"),
        vendorName: (id) => vendorById.get(id)?.name ?? "vendor",
      }),
    [devices, tickets, vendorRequests, inventory, limit, buildingById, vendorById]
  );

  const groups = events.reduce<{ day: string; items: ActivityEvent[] }[]>((acc, e) => {
    const day = dayLabel(e.at);
    const last = acc[acc.length - 1];
    if (last && last.day === day) last.items.push(e);
    else acc.push({ day, items: [e] });
    return acc;
  }, []);

  return (
    <Panel labelledBy="aktivitas-title" className={cn("flex flex-col", className)}>
      <SectionHeader
        id="aktivitas-title"
        eyebrow="Log operasional"
        title="Aktivitas terbaru"
        description="Unit berhenti melapor, tiket, kunjungan, rujukan vendor, dan mutasi stok."
      />
      <div className="scrollbar-thin flex-1 overflow-y-auto border-t border-line px-5 pt-3 pb-4 xl:max-h-[560px]">
        {groups.map((group) => (
          <section key={group.day} className="mb-2 last:mb-0">
            <h3 className="eyebrow sticky top-0 z-[1] -mx-5 bg-surface/95 px-5 py-1.5 text-[10.5px] text-subtle backdrop-blur">
              {group.day}
            </h3>
            <ol className="relative">
              {group.items.map((e, i) => (
                <li key={e.id} className="relative grid grid-cols-[44px_14px_minmax(0,1fr)] gap-x-2.5">
                  <time dateTime={e.at} className="tabular pt-2.5 font-mono text-[11.5px] text-muted">
                    {formatTime(e.at)}
                  </time>
                  {/* Garis waktu vertikal dengan simpul berwarna status. */}
                  <span className="relative flex justify-center" aria-hidden>
                    <span className={cn("absolute w-px bg-line-strong", i === 0 ? "top-4" : "top-0", i === group.items.length - 1 ? "h-4" : "bottom-0")} />
                    <span className={cn("relative mt-[13px] size-[7px] rounded-full ring-[3px] ring-surface", TONE_DOT[e.tone])} />
                  </span>
                  <Link href={e.href} className="group -mx-2 min-w-0 rounded-md px-2 py-2 transition-colors hover:bg-hover">
                    <p className="text-[13px] leading-snug text-ink group-hover:text-ink">{e.title}</p>
                    <p className="mt-0.5 truncate text-[11.5px] text-muted">{e.subject}</p>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </Panel>
  );
}
