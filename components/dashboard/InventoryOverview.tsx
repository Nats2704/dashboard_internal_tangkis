import Link from "next/link";
import type { InventoryFlow, InventoryRecord } from "@/types/inventory";
import { Panel, SectionHeader } from "@/components/ui/Panel";
import { buttonClasses } from "@/components/ui/Button";
import { InventoryWorkspace } from "@/components/inventory/InventoryWorkspace";

export function InventoryOverview({ records, flows }: { records: InventoryRecord[]; flows: InventoryFlow[] }) {
  return (
    <Panel id="stok" labelledBy="stok-title">
      <SectionHeader
        id="stok-title"
        title="Stok Perangkat"
        description="Posisi setiap unit dalam siklus gudang, pemasangan, perbaikan, dan penarikan."
        actions={
          <Link href="/inventory" className={buttonClasses("secondary", "sm")}>
            Lihat semua
          </Link>
        }
      />
      <InventoryWorkspace records={records} flows={flows} pageSize={5} />
    </Panel>
  );
}
