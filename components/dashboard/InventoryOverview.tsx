import type { InventoryFlow, InventoryRecord } from "@/types/inventory";
import { Panel, SectionHeader } from "@/components/ui/Panel";
import { InventoryWorkspace } from "@/components/inventory/InventoryWorkspace";

export function InventoryOverview({ records, flows }: { records: InventoryRecord[]; flows: InventoryFlow[] }) {
  return (
    <Panel id="stok" labelledBy="stok-title">
      <SectionHeader
        id="stok-title"
        eyebrow="Logistik"
        title="Stok perangkat"
        description="Posisi setiap unit dalam siklus gudang, pemasangan, perbaikan, dan penarikan."
        href="/inventory"
        linkLabel="Lihat semua stok"
      />
      <InventoryWorkspace records={records} flows={flows} pageSize={5} />
    </Panel>
  );
}
