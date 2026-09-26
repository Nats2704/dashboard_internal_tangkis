import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { EconomicsView } from "@/components/economics/EconomicsView";
import { getBuildingEconomics } from "@/lib/services/economicsService";

export const metadata: Metadata = { title: "Ekonomi Gedung" };

export default async function EconomicsPage() {
  const rows = await getBuildingEconomics();
  return (
    <PageContainer>
      <PageHeader
        title="Ekonomi Gedung"
        description="Apakah biaya nyata melayani tiap gedung masih sesuai asumsi model bisnis?"
      />
      <EconomicsView rows={rows} />
    </PageContainer>
  );
}
