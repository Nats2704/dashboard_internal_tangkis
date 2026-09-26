import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { ServiceView } from "@/components/service/ServiceView";

export const metadata: Metadata = { title: "Tiket Servis" };

export default function ServicePage() {
  return (
    <PageContainer>
      <PageHeader title="Tiket Servis" description="Tiket, kunjungan lapangan, penugasan teknisi, dan biaya per kunjungan." />
      <Suspense>
        <ServiceView />
      </Suspense>
    </PageContainer>
  );
}
