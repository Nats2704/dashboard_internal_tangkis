"use client";

import { useMemo } from "react";
import type { Contract } from "@/types/contract";
import type { Sensor } from "@/types/sensor";
import { Tabs } from "@/components/ui/Tabs";
import { warrantyState } from "@/lib/analytics/contracts";
import { daysUntil } from "@/lib/utils/format";
import { useDeviceDrawer } from "@/components/devices/useDeviceDrawer";
import { ContractTable } from "./ContractTable";

export type ContractFilter = "all" | "owned" | "rental" | "expiring" | "due";

export function filterContracts(contracts: Contract[], filter: ContractFilter): Contract[] {
  switch (filter) {
    case "owned":
    case "rental":
      return contracts.filter((c) => c.ownership === filter);
    case "expiring":
      return contracts.filter((c) => warrantyState(c) === "expiring");
    case "due":
      return contracts.filter((c) => {
        const d = daysUntil(c.dueDate);
        return d >= 0 && d <= 90;
      });
    default:
      return contracts;
  }
}

interface ContractWorkspaceProps {
  contracts: Contract[];
  sensors?: Sensor[];
  filter: ContractFilter;
  onFilterChange: (filter: ContractFilter) => void;
  pageSize: number;
  query?: string;
}

export function ContractWorkspace({ contracts, sensors, filter, onFilterChange, pageSize, query = "" }: ContractWorkspaceProps) {
  const { openDevice, selectedDeviceId, drawer } = useDeviceDrawer(sensors, contracts);

  const counts = useMemo(
    () => ({
      all: contracts.length,
      owned: filterContracts(contracts, "owned").length,
      rental: filterContracts(contracts, "rental").length,
      expiring: filterContracts(contracts, "expiring").length,
      due: filterContracts(contracts, "due").length,
    }),
    [contracts]
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = filterContracts(contracts, filter).filter(
      (c) => !q || c.deviceId.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
    );
    // Yang paling dekat jatuh tempo (atau habis garansi) tampil lebih dulu.
    const dateOf = (c: Contract) => Date.parse(filter === "expiring" ? c.warrantyEnd : c.dueDate);
    return [...list].sort((a, b) => dateOf(a) - dateOf(b));
  }, [contracts, filter, query]);

  const selectedContractId = selectedDeviceId ? contracts.find((c) => c.deviceId === selectedDeviceId)?.id : null;

  return (
    <div>
      <div className="px-5 pt-4 pb-3">
        <Tabs
          label="Filter kontrak"
          value={filter}
          onChange={onFilterChange}
          items={[
            { value: "all", label: "Semua", count: counts.all },
            { value: "owned", label: "Milik pelanggan", count: counts.owned },
            { value: "rental", label: "Sewa", count: counts.rental },
            { value: "expiring", label: "Garansi hampir habis", count: counts.expiring },
            { value: "due", label: "Jatuh tempo 90 hari", count: counts.due },
          ]}
        />
      </div>
      <div className="border-t border-line">
        <ContractTable
          key={`${filter}-${query}`}
          contracts={rows}
          onSelect={(c) => openDevice(c.deviceId)}
          selectedId={selectedContractId}
          pageSize={pageSize}
        />
      </div>
      {drawer}
    </div>
  );
}
