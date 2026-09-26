"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { LifecycleStage } from "@/types/device";
import type { InventoryFlow, InventoryRecord } from "@/types/inventory";
import { Panel, SectionHeader } from "@/components/ui/Panel";
import { SearchInput } from "@/components/ui/SearchInput";
import { InventoryWorkspace } from "./InventoryWorkspace";

const VALID: LifecycleStage[] = ["warehouse", "installed", "repair", "returned"];

export function InventoryView({ records, flows }: { records: InventoryRecord[]; flows: InventoryFlow[] }) {
  const params = useSearchParams();
  const [query, setQuery] = useState("");
  const stage = params.get("stage") as LifecycleStage | null;
  return (
    <Panel labelledBy="stok-title">
      <SectionHeader
        id="stok-title"
        title="Siklus unit"
        description="Pilih tahap untuk melihat unit di dalamnya. Klik unit untuk riwayat perpindahan."
        actions={<SearchInput value={query} onChange={setQuery} placeholder="Cari unit atau lokasi" label="Cari stok" />}
      />
      <InventoryWorkspace
        key={params.toString()}
        records={records}
        flows={flows}
        pageSize={15}
        initialStage={stage && VALID.includes(stage) ? stage : "warehouse"}
        query={query}
      />
    </Panel>
  );
}
