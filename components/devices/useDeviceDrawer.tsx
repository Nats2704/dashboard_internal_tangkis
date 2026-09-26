"use client";

import { useCallback, useMemo, useState } from "react";
import type { Sensor } from "@/types/sensor";
import type { Contract } from "@/types/contract";
import { useFleet } from "@/components/providers/FleetProvider";
import { DeviceDetailDrawer } from "./DeviceDetailDrawer";

/**
 * Drawer detail unit yang bisa dibuka dari tabel mana pun. Data sensor dan
 * kontrak opsional, jadi komponen tetap bekerja walau halaman tidak memuatnya.
 */
export function useDeviceDrawer(sensors?: Sensor[], contracts?: Contract[]) {
  const { deviceById } = useFleet();
  const [deviceId, setDeviceId] = useState<string | null>(null);

  const sensorsByDevice = useMemo(() => {
    const map = new Map<string, Sensor[]>();
    for (const s of sensors ?? []) {
      const list = map.get(s.deviceId) ?? [];
      list.push(s);
      map.set(s.deviceId, list);
    }
    return map;
  }, [sensors]);

  const contractByDevice = useMemo(
    () => new Map((contracts ?? []).map((c) => [c.deviceId, c])),
    [contracts]
  );

  const close = useCallback(() => setDeviceId(null), []);
  const device = deviceId ? deviceById.get(deviceId) ?? null : null;

  const drawer = (
    <DeviceDetailDrawer
      device={device}
      onClose={close}
      sensors={deviceId ? sensorsByDevice.get(deviceId) : undefined}
      contract={deviceId ? contractByDevice.get(deviceId) : undefined}
    />
  );

  return { openDevice: setDeviceId, selectedDeviceId: deviceId, drawer };
}
