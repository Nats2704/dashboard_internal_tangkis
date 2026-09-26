import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { HeroSummary } from "@/components/dashboard/HeroSummary";
import { DevicesView } from "@/components/devices/DevicesView";
import { getSensors } from "@/lib/services/sensorService";
import { getContracts } from "@/lib/services/contractService";

export const metadata: Metadata = { title: "Unit & Perangkat" };

export default async function DevicesPage() {
  const [sensors, contracts] = await Promise.all([getSensors(), getContracts()]);
  return (
    <PageContainer>
      <PageHeader
        title="Unit & Perangkat"
        description="Kesehatan setiap unit: koneksi, sinyal, baterai cadangan, firmware, dan status maintenance."
      />
      <div className="space-y-6">
        <HeroSummary />
        <Suspense>
          <DevicesView sensors={sensors} contracts={contracts} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
