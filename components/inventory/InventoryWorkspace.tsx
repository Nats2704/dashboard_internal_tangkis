"use client";

import { useMemo, useState } from "react";
import { Lightbulb } from "lucide-react";
import type { LifecycleStage } from "@/types/device";
import type { InventoryFlow, InventoryRecord } from "@/types/inventory";
import { useFleet } from "@/components/providers/FleetProvider";
import { summarizeInventory } from "@/lib/analytics/inventory";
import { LifecycleStages } from "./LifecycleStages";
import { InventoryTable } from "./InventoryTable";
import { InventoryDetailDrawer } from "./InventoryDetailDrawer";

interface InventoryWorkspaceProps {
  records: InventoryRecord[];
  flows: InventoryFlow[];
  pageSize: number;
  initialStage?: LifecycleStage;
  query?: string;
}

export function InventoryWorkspace({ records, flows, pageSize, initialStage = "returned", query = "" }: InventoryWorkspaceProps) {
  const { devices } = useFleet();
  const [stage, setStage] = useState<LifecycleStage>(initialStage);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const summary = useMemo(() => summarizeInventory(devices), [devices]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records
      .filter((r) => r.stage === stage)
      .filter((r) => !q || `${r.deviceId} ${r.location}`.toLowerCase().includes(q));
  }, [records, stage, query]);

  const selected = selectedId ? records.find((r) => r.deviceId === selectedId) ?? null : null;

  return (
    <div>
      <div className="px-5 pt-4 pb-4">
        <LifecycleStages byStage={summary.byStage} total={summary.total} selected={stage} onSelect={setStage} flows={flows} />
        <div className="mt-4 flex gap-2.5 rounded-md bg-info-soft/70 px-3.5 py-2.5 text-[13px] leading-snug text-ink-2">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-info" />
          <p>
            Unit sewa yang ditarik dari pelanggan berhenti bisa dipasang ulang di gedung lain.{" "}
            <span className="text-muted">
              {summary.byStage.returned} unit tarikan + {summary.byStage.warehouse} unit gudang = {summary.redeployable} unit
              tersedia tanpa produksi baru.
            </span>
          </p>
        </div>
      </div>
      <div className="border-t border-line">
        <InventoryTable
          key={`${stage}-${query}`}
          records={rows}
          onSelect={(r) => setSelectedId(r.deviceId)}
          selectedId={selectedId}
          pageSize={pageSize}
        />
      </div>
      <InventoryDetailDrawer record={selected} onClose={() => setSelectedId(null)} />
    </div>
  );
}
