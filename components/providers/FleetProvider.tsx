"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Device } from "@/types/device";

interface FleetContextValue {
  devices: Device[];
  deviceById: Map<string, Device>;
  applyFirmware: (deviceIds: string[], version: string) => void;
}

const FleetContext = createContext<FleetContextValue | null>(null);

/**
 * State armada di sisi client. Dipasang di layout supaya perubahan (mis.
 * pembaruan firmware) tetap terlihat saat berpindah halaman.
 */
export function FleetProvider({
  initialDevices,
  children,
}: {
  initialDevices: Device[];
  children: ReactNode;
}) {
  const [devices, setDevices] = useState(initialDevices);

  const applyFirmware = useCallback((deviceIds: string[], version: string) => {
    const ids = new Set(deviceIds);
    setDevices((list) => list.map((d) => (ids.has(d.id) ? { ...d, firmware: version } : d)));
  }, []);

  const value = useMemo(
    () => ({
      devices,
      deviceById: new Map(devices.map((d) => [d.id, d])),
      applyFirmware,
    }),
    [devices, applyFirmware]
  );

  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>;
}

export function useFleet(): FleetContextValue {
  const context = useContext(FleetContext);
  if (!context) throw new Error("useFleet harus dipakai di dalam FleetProvider");
  return context;
}
