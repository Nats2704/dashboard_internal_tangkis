"use client";

import type { LifecycleStage } from "@/types/device";
import type { InventoryFlow } from "@/types/inventory";
import { LIFECYCLE } from "@/lib/constants/status";
import { LIFECYCLE_ORDER } from "@/lib/analytics/inventory";
import { formatPercent } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const STAGE_BAR: Record<LifecycleStage, string> = {
  warehouse: "bg-line-strong",
  installed: "bg-success",
  repair: "bg-warning",
  returned: "bg-info/70",
};

const STAGE_HINT: Record<LifecycleStage, string> = {
  warehouse: "Siap pasang",
  installed: "Di gedung pelanggan",
  repair: "Workshop Cikupa",
  returned: "Menunggu pemeriksaan",
};

interface LifecycleStagesProps {
  byStage: Record<LifecycleStage, number>;
  total: number;
  selected: LifecycleStage;
  onSelect: (stage: LifecycleStage) => void;
  flows: InventoryFlow[];
}

export function LifecycleStages({ byStage, total, selected, onSelect, flows }: LifecycleStagesProps) {
  const flowLabel = (from: LifecycleStage, to: LifecycleStage) => flows.find((f) => f.from === from && f.to === to)?.count ?? 0;

  return (
    <div>
      <div role="tablist" aria-label="Tahap siklus unit" className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-4">
        {LIFECYCLE_ORDER.map((stage) => {
          const active = stage === selected;
          return (
            <button
              key={stage}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSelect(stage)}
              className={cn(
                "relative bg-surface px-4 pt-3.5 pb-4 text-left transition-colors",
                active ? "bg-accent-soft/50" : "hover:bg-sunken"
              )}
            >
              {active ? <span className="absolute inset-x-0 top-0 h-0.5 bg-accent" aria-hidden /> : null}
              <span className="block text-[12.5px] text-muted">{LIFECYCLE[stage].label}</span>
              <span className="mt-1 block text-[24px] leading-7 font-semibold tracking-tight text-ink">{byStage[stage]}</span>
              <span className="mt-0.5 block text-[12px] text-muted">
                {formatPercent((byStage[stage] / Math.max(1, total)) * 100)} · {STAGE_HINT[stage]}
              </span>
              <span className="mt-3 block h-1 w-full rounded-full bg-black/[0.05]">
                <span
                  className={cn("block h-full rounded-full", STAGE_BAR[stage])}
                  style={{ width: `${(byStage[stage] / Math.max(1, total)) * 100}%` }}
                />
              </span>
            </button>
          );
        })}
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[12.5px] md:grid-cols-4">
        <div className="flex justify-between gap-2 md:block">
          <dt className="text-muted">Gudang → terpasang</dt>
          <dd className="tabular text-ink-2">{flowLabel("warehouse", "installed")} unit</dd>
        </div>
        <div className="flex justify-between gap-2 md:block">
          <dt className="text-muted">Terpasang → workshop</dt>
          <dd className="tabular text-ink-2">{flowLabel("installed", "repair")} unit</dd>
        </div>
        <div className="flex justify-between gap-2 md:block">
          <dt className="text-muted">Workshop → terpasang</dt>
          <dd className="tabular text-ink-2">{flowLabel("repair", "installed")} unit</dd>
        </div>
        <div className="flex justify-between gap-2 md:block">
          <dt className="text-muted">Ditarik dari pelanggan</dt>
          <dd className="tabular text-ink-2">{flowLabel("installed", "returned")} unit</dd>
        </div>
      </dl>
      <p className="mt-1.5 text-[11.5px] text-subtle">Perpindahan 90 hari terakhir.</p>
    </div>
  );
}
