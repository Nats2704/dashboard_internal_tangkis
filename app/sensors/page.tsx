import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { SensorsView } from "@/components/sensors/SensorsView";
import { getSensors, getSensorTrend } from "@/lib/services/sensorService";

export const metadata: Metadata = { title: "Sensor BBM" };

export default async function SensorsPage() {
  const [sensors, trend] = await Promise.all([getSensors(), getSensorTrend()]);
  return (
    <PageContainer>
      <PageHeader
        title="Sensor BBM"
        description="Kesehatan sensor dan selisih pembacaan terhadap hasil lab terakhir."
      />
      <Suspense>
        <SensorsView sensors={sensors} trend={trend} />
      </Suspense>
    </PageContainer>
  );
}
