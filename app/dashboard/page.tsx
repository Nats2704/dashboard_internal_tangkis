import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { Greeting } from "@/components/dashboard/Greeting";
import { HeroSummary } from "@/components/dashboard/HeroSummary";
import { FleetMapSection } from "@/components/dashboard/FleetMapSection";
import { DeviceOverview } from "@/components/dashboard/DeviceOverview";
import { SensorHealth } from "@/components/dashboard/SensorHealth";
import { ContractOverview } from "@/components/dashboard/ContractOverview";
import { ServiceOverview } from "@/components/dashboard/ServiceOverview";
import { InventoryOverview } from "@/components/dashboard/InventoryOverview";
import { VendorOverview } from "@/components/dashboard/VendorOverview";
import { BuildingEconomics } from "@/components/dashboard/BuildingEconomics";
import { getSensors, getSensorTrend } from "@/lib/services/sensorService";
import { getContracts } from "@/lib/services/contractService";
import { getInventory, getInventoryFlows } from "@/lib/services/inventoryService";
import { getVendorRequests } from "@/lib/services/vendorService";
import { getBuildingEconomics } from "@/lib/services/economicsService";
import { getNotifications } from "@/lib/services/notificationService";
import { DATA_SNAPSHOT_AT } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Beranda" };

export default async function DashboardPage() {
  const [sensors, trend, contracts, inventory, flows, vendorRequests, economics, notifications] = await Promise.all([
    getSensors(),
    getSensorTrend(),
    getContracts(),
    getInventory(),
    getInventoryFlows(),
    getVendorRequests(),
    getBuildingEconomics(),
    getNotifications(),
  ]);

  return (
    <PageContainer>
      <PageHeader
        title={<Greeting />}
        description="Berikut ringkasan kondisi unit, sensor, dan operasional hari ini."
        meta={`Data per ${formatDateTime(DATA_SNAPSHOT_AT)}`}
      />
      <div className="space-y-14">
        <div className="space-y-10">
          <HeroSummary />
          <FleetMapSection notifications={notifications} />
        </div>
        <DeviceOverview sensors={sensors} contracts={contracts} />
        <SensorHealth sensors={sensors} trend={trend} />
        <ContractOverview contracts={contracts} sensors={sensors} />
        <ServiceOverview />
        <InventoryOverview records={inventory} flows={flows} />
        <VendorOverview requests={vendorRequests} />
        <BuildingEconomics rows={economics} />
      </div>
    </PageContainer>
  );
}
