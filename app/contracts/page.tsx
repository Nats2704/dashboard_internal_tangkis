import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { ContractsView } from "@/components/contracts/ContractsView";
import { getContracts } from "@/lib/services/contractService";
import { getSensors } from "@/lib/services/sensorService";

export const metadata: Metadata = { title: "Kontrak & Pelanggan" };

export default async function ContractsPage() {
  const [contracts, sensors] = await Promise.all([getContracts(), getSensors()]);
  return (
    <PageContainer>
      <PageHeader title="Kontrak & Pelanggan" description="Kepemilikan unit, masa garansi, dan jadwal jatuh tempo per pelanggan." />
      <Suspense>
        <ContractsView contracts={contracts} sensors={sensors} />
      </Suspense>
    </PageContainer>
  );
}
