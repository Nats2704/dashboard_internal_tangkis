"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useFleet } from "@/components/providers/FleetProvider";
import { useReferenceData } from "@/components/providers/ReferenceDataProvider";
import { formatNumber, hoursSince } from "@/lib/utils/format";

/** Unit offline terlama, dengan batang durasi sejak data terakhir. */
export function OfflineUnits({ minHours = 24, limit = 6 }: { minHours?: number; limit?: number }) {
  const { devices } = useFleet();
  const { buildingById } = useReferenceData();
  const units = useMemo(
    () =>
      devices
        .filter((d) => d.connectivity === "offline" && d.lastSeen && hoursSince(d.lastSeen) > minHours)
        .map((d) => ({ device: d, hours: hoursSince(d.lastSeen as string) }))
        .sort((a, b) => b.hours - a.hours)
        .slice(0, limit),
    [devices, minHours, limit]
  );
  const max = Math.max(...units.map((u) => u.hours), 1);

  return (
    <ul className="space-y-1.5">
      {units.map(({ device, hours }) => (
        <li key={device.id}>
          <Link
            href={`/devices?unit=${encodeURIComponent(device.id)}`}
            className="grid grid-cols-[76px_minmax(0,1fr)_minmax(60px,0.8fr)_52px] items-center gap-3 rounded px-2 py-1.5 transition-colors hover:bg-hover"
          >
            <span className="font-mono text-[12px] text-ink">{device.id}</span>
            <span className="truncate text-[12px] text-muted">{buildingById.get(device.buildingId ?? "")?.name}</span>
            <span className="h-1 overflow-hidden rounded-full bg-fill" aria-hidden>
              <span className="block h-full rounded-full bg-danger/80" style={{ width: `${(hours / max) * 100}%` }} />
            </span>
            <span className="tabular text-right text-[12px] text-danger">{formatNumber(hours, 0)} jam</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
