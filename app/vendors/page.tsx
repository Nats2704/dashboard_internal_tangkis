import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { VendorsView } from "@/components/vendors/VendorsView";
import { getVendorRequests } from "@/lib/services/vendorService";

export const metadata: Metadata = { title: "Rujukan Vendor" };

export default async function VendorsPage() {
  const requests = await getVendorRequests();
  return (
    <PageContainer>
      <PageHeader title="Rujukan Vendor" description="Pekerjaan cleaning, maintenance, pasok BBM, dan kalibrasi yang dirujuk ke mitra." />
      <VendorsView requests={requests} />
    </PageContainer>
  );
}
