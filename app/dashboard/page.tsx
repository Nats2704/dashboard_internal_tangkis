import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { SectionDivider } from "@/components/ui/Panel";
import { Greeting } from "@/components/dashboard/Greeting";
import { StatusLine } from "@/components/dashboard/StatusLine";
import { ActiveAlerts } from "@/components/dashboard/ActiveAlerts";
import { SystemHealth } from "@/components/dashboard/SystemHealth";
import { HeroSummary } from "@/components/dashboard/HeroSummary";
import { FleetNodes } from "@/components/dashboard/FleetNodes";
import { FuelIntelligence } from "@/components/dashboard/FuelIntelligence";
import { FleetMapSection } from "@/components/dashboard/FleetMapSection";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { DeviceNetwork } from "@/components/dashboard/DeviceNetwork";
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

/**
 * Beranda disusun dari yang paling butuh perhatian: alarm dan status armada,
 * metrik kunci, kondisi BBM dan tren, lokasi dan aktivitas, perangkat, lalu
 * modul operasional dan bisnis.
 */
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
        eyebrow={<StatusLine notifications={notifications} />}
        title={<Greeting />}
        description="Infrastruktur daya kritis pelanggan dipantau terus-menerus. Ini kondisi armada saat ini."
        meta={`Data per ${formatDateTime(DATA_SNAPSHOT_AT)}`}
      />

      <div className="space-y-4 lg:space-y-5">
        <ActiveAlerts notifications={notifications} limit={3} />

        <div className="grid gap-4 lg:gap-5 xl:grid-cols-12">
          <SystemHealth sensors={sensors} className="xl:col-span-5" />
          <HeroSummary layout="grid" sensorTrend={trend} className="xl:col-span-7" />
        </div>

        <FleetNodes sensors={sensors} />
        <FuelIntelligence sensors={sensors} />
        <SensorHealth sensors={sensors} trend={trend} />

        <div className="grid gap-4 lg:gap-5 xl:grid-cols-12">
          <FleetMapSection className="xl:col-span-8" />
          <ActivityTimeline vendorRequests={vendorRequests} inventory={inventory} className="xl:col-span-4" />
        </div>

        <SectionDivider title="Perangkat & jaringan" />
        <DeviceNetwork sensors={sensors} />
        <DeviceOverview sensors={sensors} contracts={contracts} />

        <SectionDivider title="Operasional & bisnis" />
        <ServiceOverview />
        <ContractOverview contracts={contracts} sensors={sensors} />
        <InventoryOverview records={inventory} flows={flows} />
        <VendorOverview requests={vendorRequests} />
        <BuildingEconomics rows={economics} />
      </div>
    </PageContainer>
  );
}
