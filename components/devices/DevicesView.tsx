"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Sensor } from "@/types/sensor";
import type { Contract } from "@/types/contract";
import type { ConnectivityStatus, LifecycleStage } from "@/types/device";
import { useFleet } from "@/components/providers/FleetProvider";
import { useReferenceData } from "@/components/providers/ReferenceDataProvider";
import { Panel, SectionHeader } from "@/components/ui/Panel";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { SearchInput, Select } from "@/components/ui/SearchInput";
import { connectivityRank, isOutdated, summarizeFleet } from "@/lib/analytics/devices";
import { DeviceTable } from "./DeviceTable";
import { FirmwareUpdateModal } from "./FirmwareUpdateModal";
import { UnitMapPanel } from "./UnitMapPanel";
import { useDeviceDrawer } from "./useDeviceDrawer";

type StatusFilter = "all" | ConnectivityStatus | Exclude<LifecycleStage, "installed">;
type FirmwareFilter = "all" | "outdated";

const STATUS_VALUES: StatusFilter[] = ["all", "online", "offline", "maintenance", "warehouse", "repair", "returned"];

export function DevicesView({ sensors, contracts }: { sensors: Sensor[]; contracts: Contract[] }) {
  const params = useSearchParams();
  const { devices } = useFleet();
  const { buildings } = useReferenceData();
  const initialStatus = params.get("status") as StatusFilter | null;

  const [status, setStatus] = useState<StatusFilter>(
    initialStatus && STATUS_VALUES.includes(initialStatus) ? initialStatus : "all"
  );
  const [building, setBuilding] = useState(params.get("building") ?? "all");
  const [firmware, setFirmware] = useState<FirmwareFilter>(params.get("firmware") === "outdated" ? "outdated" : "all");
  const [query, setQuery] = useState("");
  const [firmwareOpen, setFirmwareOpen] = useState(false);
  const [updatedIds, setUpdatedIds] = useState<Set<string>>(() => new Set());
  const { openDevice, selectedDeviceId, drawer } = useDeviceDrawer(sensors, contracts);

  // Tautan dari pencarian global atau peta (?unit=GM-014, ?building=...) bisa
  // datang saat halaman sudah terbuka, jadi bandingkan dengan nilai terakhir.
  const unitParam = params.get("unit");
  const buildingParam = params.get("building");
  const [handled, setHandled] = useState<{ unit: string | null; building: string | null }>({
    unit: null,
    building: buildingParam,
  });
  if (unitParam !== handled.unit || buildingParam !== handled.building) {
    setHandled({ unit: unitParam, building: buildingParam });
    if (unitParam && unitParam !== handled.unit) openDevice(unitParam);
    if (buildingParam !== handled.building) setBuilding(buildingParam ?? "all");
  }

  const fleet = useMemo(() => summarizeFleet(devices), [devices]);

  const statusCount = (s: StatusFilter) =>
    s === "all"
      ? devices.length
      : devices.filter((d) => (d.lifecycle === "installed" ? d.connectivity === s : d.lifecycle === s)).length;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return devices
      .filter((d) =>
        status === "all" ? true : d.lifecycle === "installed" ? d.connectivity === status : d.lifecycle === status
      )
      .filter((d) => building === "all" || d.buildingId === building)
      .filter((d) => firmware === "all" || isOutdated(d))
      .filter((d) => !q || `${d.id} ${d.serial}`.toLowerCase().includes(q))
      .sort((a, b) => connectivityRank(a) - connectivityRank(b) || a.id.localeCompare(b.id, "id", { numeric: true }));
  }, [devices, status, building, firmware, query]);

  const filtersKey = `${status}-${building}-${firmware}-${query}`;

  return (
    <div className="space-y-12">
      <Panel labelledBy="daftar-unit-title">
        <SectionHeader
          id="daftar-unit-title"
          title="Daftar unit"
          description={`${rows.length} dari ${devices.length} unit sesuai filter.`}
          actions={
            <Button size="sm" onClick={() => setFirmwareOpen(true)} disabled={fleet.outdatedUpdatable === 0}>
              Update firmware ({fleet.outdatedUpdatable})
            </Button>
          }
        />
        <div className="flex flex-col gap-3 px-5 pt-4 pb-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <Tabs
            label="Filter status unit"
            value={status}
            onChange={setStatus}
            items={[
              { value: "all", label: "Semua", count: statusCount("all") },
              { value: "online", label: "Online", count: statusCount("online") },
              { value: "offline", label: "Offline", count: statusCount("offline") },
              { value: "maintenance", label: "Maintenance", count: statusCount("maintenance") },
              { value: "repair", label: "Perbaikan", count: statusCount("repair") },
              { value: "returned", label: "Ditarik", count: statusCount("returned") },
              { value: "warehouse", label: "Gudang", count: statusCount("warehouse") },
            ]}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Select
              label="Filter gedung"
              value={building}
              onChange={setBuilding}
              options={[{ value: "all", label: "Semua gedung" }, ...buildings.map((b) => ({ value: b.id, label: b.name }))]}
            />
            <Select
              label="Filter firmware"
              value={firmware}
              onChange={setFirmware}
              options={[
                { value: "all", label: "Semua firmware" },
                { value: "outdated", label: "Firmware lama" },
              ]}
            />
            <SearchInput value={query} onChange={setQuery} placeholder="Cari kode atau nomor seri" label="Cari unit" className="sm:w-56" />
          </div>
        </div>
        <div className="border-t border-line">
          <DeviceTable
            key={filtersKey}
            devices={rows}
            onSelect={(d) => openDevice(d.id)}
            selectedId={selectedDeviceId}
            pageSize={15}
            highlightIds={updatedIds}
          />
        </div>
      </Panel>

      <Panel labelledBy="peta-unit-title">
        <SectionHeader id="peta-unit-title" title="Peta sebaran" description="Warna mengikuti status terburuk di tiap gedung." />
        <UnitMapPanel />
      </Panel>

      <FirmwareUpdateModal
        open={firmwareOpen}
        onClose={() => setFirmwareOpen(false)}
        onUpdated={(ids) => setUpdatedIds(new Set(ids))}
      />
      {drawer}
    </div>
  );
}
