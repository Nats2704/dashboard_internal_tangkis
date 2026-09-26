import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { InventoryView } from "@/components/inventory/InventoryView";
import { getInventory, getInventoryFlows } from "@/lib/services/inventoryService";

export const metadata: Metadata = { title: "Stok Perangkat" };

export default async function InventoryPage() {
  const [records, flows] = await Promise.all([getInventory(), getInventoryFlows()]);
  return (
    <PageContainer>
      <PageHeader title="Stok Perangkat" description="Unit di gudang, terpasang, dalam perbaikan, dan yang ditarik dari pelanggan." />
      <Suspense>
        <InventoryView records={records} flows={flows} />
      </Suspense>
    </PageContainer>
  );
}
