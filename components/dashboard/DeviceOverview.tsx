"use client";

import { useMemo, useState } from "react";
import type { Sensor } from "@/types/sensor";
import type { Contract } from "@/types/contract";
import { useFleet } from "@/components/providers/FleetProvider";
import { summarizeFleet, connectivityRank } from "@/lib/analytics/devices";
import { LOW_BATTERY_PCT, WEAK_SIGNAL_DBM } from "@/lib/constants";
import { Panel, SectionHeader } from "@/components/ui/Panel";
import { Tabs } from "@/components/ui/Tabs";
import { DeviceTable } from "@/components/devices/DeviceTable";
import { FleetHealthAside } from "@/components/devices/FleetHealthAside";
import { FirmwareUpdateModal } from "@/components/devices/FirmwareUpdateModal";
import { useDeviceDrawer } from "@/components/devices/useDeviceDrawer";

type View = "attention" | "all" | "offline" | "maintenance";

export function DeviceOverview({ sensors, contracts }: { sensors: Sensor[]; contracts: Contract[] }) {
  const { devices } = useFleet();
  const [view, setView] = useState<View>("attention");
  const [firmwareOpen, setFirmwareOpen] = useState(false);
  const [updatedIds, setUpdatedIds] = useState<Set<string>>(() => new Set());
  const { openDevice, selectedDeviceId, drawer } = useDeviceDrawer(sensors, contracts);

  const installed = useMemo(() => devices.filter((d) => d.lifecycle === "installed"), [devices]);
  const fleet = useMemo(() => summarizeFleet(devices), [devices]);

  const rows = useMemo(() => {
    const needsAttention = (d: (typeof installed)[number]) =>
      d.connectivity !== "online" ||
      (d.batteryPct ?? 100) < LOW_BATTERY_PCT ||
      (d.signalDbm ?? 0) < WEAK_SIGNAL_DBM ||
      updatedIds.has(d.id);
    const filtered =
      view === "attention"
        ? installed.filter(needsAttention)
        : view === "all"
          ? installed
          : installed.filter((d) => d.connectivity === view);
    return [...filtered].sort(
      (a, b) => connectivityRank(a) - connectivityRank(b) || a.id.localeCompare(b.id, "id", { numeric: true })
    );
  }, [installed, view, updatedIds]);

  return (
    <Panel id="kesehatan-alat" labelledBy="kesehatan-alat-title">
      <SectionHeader
        id="kesehatan-alat-title"
        eyebrow="Perangkat"
        title="Kesehatan alat"
        description={`Status koneksi, sinyal, baterai, dan firmware ${fleet.installed} unit terpasang.`}
        href="/devices"
        linkLabel="Lihat semua unit"
      />
      <div className="grid xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 xl:border-r xl:border-line">
          <div className="px-5 pt-4 pb-3">
            <Tabs
              label="Tampilan unit"
              value={view}
              onChange={setView}
              items={[
                { value: "attention", label: "Perlu perhatian" },
                { value: "all", label: "Semua", count: fleet.installed },
                { value: "offline", label: "Offline", count: fleet.offline },
                { value: "maintenance", label: "Maintenance", count: fleet.maintenance },
              ]}
            />
          </div>
          <div className="border-t border-line">
            <DeviceTable
              key={view}
              devices={rows}
              onSelect={(d) => openDevice(d.id)}
              selectedId={selectedDeviceId}
              pageSize={8}
              highlightIds={updatedIds}
            />
          </div>
        </div>
        <div className="border-t border-line xl:border-t-0">
          <FleetHealthAside
            devices={devices}
            outdatedUpdatable={fleet.outdatedUpdatable}
            onUpdateFirmware={() => setFirmwareOpen(true)}
            onSelectDevice={openDevice}
          />
        </div>
      </div>
      <FirmwareUpdateModal
        open={firmwareOpen}
        onClose={() => setFirmwareOpen(false)}
        onUpdated={(ids) => setUpdatedIds(new Set(ids))}
      />
      {drawer}
    </Panel>
  );
}
