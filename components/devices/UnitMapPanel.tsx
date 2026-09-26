"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { ConnectivityStatus } from "@/types/device";
import { useFleet } from "@/components/providers/FleetProvider";
import { useReferenceData } from "@/components/providers/ReferenceDataProvider";
import { Tabs } from "@/components/ui/Tabs";
import { cn } from "@/lib/utils/cn";
import { MARKER_COLOR, REGIONS, type MapFilter, type RegionKey, type SiteMarker } from "./map-types";

const UnitMap = dynamic(() => import("./UnitMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-sunken text-[13px] text-muted">
      Memuat peta…
    </div>
  ),
});

const SEVERITY: ConnectivityStatus[] = ["offline", "maintenance", "online"];

export function UnitMapPanel({ className }: { className?: string }) {
  const { devices } = useFleet();
  const { buildings } = useReferenceData();
  const [filter, setFilter] = useState<MapFilter>("all");
  const [region, setRegion] = useState<RegionKey>("jabodetabek");

  const sites = useMemo<SiteMarker[]>(() => {
    return buildings
      .map((building) => {
        const units = devices.filter((d) => d.buildingId === building.id && d.lifecycle === "installed");
        const counts = { online: 0, offline: 0, maintenance: 0 } as Record<ConnectivityStatus, number>;
        for (const u of units) if (u.connectivity) counts[u.connectivity] += 1;
        const status = SEVERITY.find((s) => counts[s] > 0) ?? "online";
        const flagged = units
          .filter((u) => u.connectivity !== "online")
          .sort((a, b) => SEVERITY.indexOf(a.connectivity!) - SEVERITY.indexOf(b.connectivity!));
        return { building, counts, status, flagged, sample: units[0] ?? null, total: units.length };
      })
      .filter((site) => site.total > 0);
  }, [buildings, devices]);

  const visible = filter === "all" ? sites : sites.filter((s) => s.counts[filter] > 0);
  const totals = sites.reduce(
    (acc, s) => {
      acc.online += s.counts.online;
      acc.offline += s.counts.offline;
      acc.maintenance += s.counts.maintenance;
      return acc;
    },
    { online: 0, offline: 0, maintenance: 0 }
  );

  return (
    // flex flex-col wajib: div peta di bawah pakai min-h+flex-1, yang cuma
    // jadi tinggi pasti (dibutuhkan elemen h-full Leaflet) kalau parent-nya
    // flex column. Dibakukan di sini (bukan diserahkan ke tiap pemanggil)
    // supaya bug "peta tinggi 0px" ini tidak terulang di halaman lain.
    <div className={cn("flex flex-col", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4 pb-3">
        <Tabs
          label="Filter status di peta"
          value={filter}
          onChange={setFilter}
          items={[
            { value: "all", label: "Semua", count: sites.reduce((n, s) => n + s.total, 0) },
            { value: "online", label: "Online", count: totals.online },
            { value: "offline", label: "Offline", count: totals.offline },
            { value: "maintenance", label: "Maintenance", count: totals.maintenance },
          ]}
        />
        <Tabs
          label="Wilayah"
          variant="segmented"
          value={region}
          onChange={setRegion}
          items={(Object.keys(REGIONS) as RegionKey[]).map((key) => ({ value: key, label: REGIONS[key].label }))}
        />
      </div>
      {/* min-h wajib: di kolom ber-tinggi auto, flex-1 saja membuat peta menyusut ke 0 di layar sempit. */}
      <div className="relative isolate z-0 min-h-[320px] flex-1 border-y border-line sm:min-h-[380px]">
        <UnitMap sites={visible} filter={filter} region={region} />
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 px-5 py-3 text-[12px] text-muted">
        {(Object.keys(MARKER_COLOR) as ConnectivityStatus[]).map((status) => (
          <span key={status} className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: MARKER_COLOR[status] }} aria-hidden />
            {status === "online" ? "Semua online" : status === "offline" ? "Ada unit offline" : "Ada maintenance"}
          </span>
        ))}
        <span className="ml-auto">Ukuran lingkaran sebanding jumlah unit per gedung</span>
      </div>
    </div>
  );
}
