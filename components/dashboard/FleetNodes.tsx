"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Sensor } from "@/types/sensor";
import { useFleet } from "@/components/providers/FleetProvider";
import { useReferenceData } from "@/components/providers/ReferenceDataProvider";
import { summarizeSites, type SiteSummary } from "@/lib/analytics/sites";
import type { HealthLevel } from "@/lib/analytics/health";
import { BUILDING_CATEGORY, type Tone } from "@/lib/constants/status";
import { formatNumber } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Panel, SectionHeader } from "@/components/ui/Panel";
import { Tabs } from "@/components/ui/Tabs";
import { StatusDot } from "@/components/ui/Badge";

const LEVEL: Record<HealthLevel, { label: string; tone: Tone; cell: string }> = {
  healthy: { label: "Sehat", tone: "success", cell: "bg-success/55" },
  warning: { label: "Perhatian", tone: "warning", cell: "bg-warning" },
  critical: { label: "Kritis", tone: "danger", cell: "bg-danger" },
};

type Filter = "all" | "critical" | "warning";

const INITIAL = 10;

function SiteNode({ site }: { site: SiteSummary }) {
  return (
    <Link
      href={`/devices?building=${site.building.id}`}
      className="group relative flex min-w-0 flex-col rounded-lg border border-line bg-sunken/60 px-3.5 py-3 transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:bg-surface-hover"
    >
      {site.level === "critical" ? (
        <span aria-hidden className="absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-danger/70 to-transparent" />
      ) : null}
      <div className="flex items-center gap-2">
        <span className="shrink-0 rounded border border-line-strong px-1 font-mono text-[10px] leading-4 text-muted">
          {site.building.code}
        </span>
        <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink" title={site.building.name}>
          {site.building.name}
        </p>
        <StatusDot tone={LEVEL[site.level].tone} className="size-2" />
        <span className="sr-only">{LEVEL[site.level].label}</span>
      </div>
      <p className="mt-0.5 truncate text-[11.5px] text-muted">
        {BUILDING_CATEGORY[site.building.category]} · {site.building.city}
      </p>

      {/* Satu sel per unit terpasang, diurutkan dari yang paling bermasalah. */}
      <div
        className="mt-2.5 flex flex-wrap gap-[3px]"
        role="img"
        aria-label={`${site.units.length} unit: ${site.counts.healthy} sehat, ${site.counts.warning} perhatian, ${site.counts.critical} kritis`}
      >
        {site.units.map((u) => (
          <span
            key={u.device.id}
            title={`${u.device.id} · ${u.reasons.join(", ") || "Sehat"}`}
            className={cn("size-[7px] rounded-[1.5px]", LEVEL[u.level].cell)}
          />
        ))}
      </div>

      <div className="mt-auto flex items-baseline justify-between gap-2 pt-2.5 text-[11.5px] whitespace-nowrap text-muted">
        <span>
          <span className="tabular font-medium text-ink-2">{site.units.length}</span> unit · BBM{" "}
          <span className="tabular font-medium text-ink-2">
            {site.avgFuelLevel !== null ? `${formatNumber(site.avgFuelLevel, 0)}%` : "—"}
          </span>
        </span>
      </div>
      <p className="mt-0.5 truncate text-[11.5px]">
        {site.counts.critical ? <span className="text-danger">{site.counts.critical} offline</span> : null}
        {site.counts.critical && site.counts.warning ? <span className="text-subtle"> · </span> : null}
        {site.counts.warning ? <span className="text-warning">{site.counts.warning} perhatian</span> : null}
        {!site.counts.critical && !site.counts.warning ? <span className="text-success">Semua unit sehat</span> : null}
      </p>
    </Link>
  );
}

export function FleetNodes({ sensors }: { sensors: Sensor[] }) {
  const { devices } = useFleet();
  const { buildings } = useReferenceData();
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState(false);
  const sites = useMemo(() => summarizeSites(buildings, devices, sensors), [buildings, devices, sensors]);
  const filtered = filter === "all" ? sites : sites.filter((s) => s.counts[filter] > 0);
  // Dua baris pertama cukup untuk melihat gedung paling bermasalah; sisanya dibuka bila perlu.
  const visible = expanded ? filtered : filtered.slice(0, INITIAL);

  return (
    <Panel id="armada" labelledBy="armada-title">
      <SectionHeader
        id="armada-title"
        eyebrow="Status armada"
        title="Armada per gedung"
        description="Setiap kotak kecil satu unit terpasang. Gedung dengan masalah tampil lebih dulu."
        actions={
          <Tabs
            label="Filter gedung"
            value={filter}
            onChange={setFilter}
            items={[
              { value: "all", label: "Semua", count: sites.length },
              { value: "critical", label: "Ada kritis", count: sites.filter((s) => s.counts.critical).length },
              { value: "warning", label: "Ada perhatian", count: sites.filter((s) => s.counts.warning).length },
            ]}
          />
        }
      />
      <div className="grid grid-cols-1 gap-2.5 px-4 pb-4 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {visible.map((site) => (
          <SiteNode key={site.building.id} site={site} />
        ))}
      </div>
      {filtered.length > INITIAL ? (
        <div className="-mt-1 px-4 pb-4">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-line-strong py-2 text-[12.5px] font-medium text-muted transition-colors hover:border-subtle hover:bg-hover hover:text-ink"
          >
            {expanded ? "Ringkas" : `Tampilkan ${filtered.length - INITIAL} gedung lainnya`}
            <ChevronDown className={cn("size-3.5 transition-transform duration-200", expanded && "rotate-180")} />
          </button>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line px-5 py-2.5 text-[11.5px] text-muted">
        {(Object.keys(LEVEL) as HealthLevel[]).map((level) => (
          <span key={level} className="inline-flex items-center gap-1.5">
            <span className={cn("size-[7px] rounded-[1.5px]", LEVEL[level].cell)} aria-hidden />
            {LEVEL[level].label}
          </span>
        ))}
        <span className="ml-auto">BBM: rata-rata level tangki di gedung</span>
      </div>
    </Panel>
  );
}
