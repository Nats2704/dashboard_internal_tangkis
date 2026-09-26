"use client";

import { useMemo } from "react";
import type { Device } from "@/types/device";
import { firmwareDistribution, signalDistribution } from "@/lib/analytics/devices";
import { LATEST_FIRMWARE } from "@/lib/constants";
import { Meter } from "@/components/ui/Meter";
import { SubHeading } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

interface FleetHealthAsideProps {
  devices: Device[];
  outdatedUpdatable: number;
  onUpdateFirmware: () => void;
  onSelectDevice: (id: string) => void;
}

export function FleetHealthAside({ devices, outdatedUpdatable, onUpdateFirmware, onSelectDevice }: FleetHealthAsideProps) {
  const firmware = useMemo(() => firmwareDistribution(devices), [devices]);
  const signal = useMemo(() => signalDistribution(devices), [devices]);
  const maintenance = useMemo(
    () => devices.filter((d) => d.connectivity === "maintenance").slice(0, 4),
    [devices]
  );
  const maintenanceTotal = devices.filter((d) => d.connectivity === "maintenance").length;
  const installed = firmware.reduce((sum, f) => sum + f.count, 0);
  const signalTotal = signal.reduce((sum, s) => sum + s.count, 0) || 1;

  return (
    <div className="divide-y divide-line">
      <div className="px-5 py-4">
        <SubHeading>Firmware</SubHeading>
        <ul className="space-y-2.5">
          {firmware.map((f) => (
            <li key={f.version}>
              <div className="mb-1 flex items-baseline justify-between text-[13px]">
                <span className={cn("tabular", f.version === LATEST_FIRMWARE ? "text-ink" : "text-warning")}>
                  {f.version}
                  {f.version === LATEST_FIRMWARE ? <span className="ml-1.5 text-[12px] text-muted">terbaru</span> : null}
                </span>
                <span className="tabular text-muted">{f.count} unit</span>
              </div>
              <Meter value={f.count} max={installed} tone={f.version === LATEST_FIRMWARE ? "neutral" : "warning"} />
            </li>
          ))}
        </ul>
        {outdatedUpdatable > 0 ? (
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3.5">
            <p className="text-[13px] leading-snug text-ink-2">
              <span className="font-semibold text-warning">{outdatedUpdatable} unit</span> menggunakan firmware lama
            </p>
            <Button size="sm" variant="secondary" onClick={onUpdateFirmware}>
              Update firmware
            </Button>
          </div>
        ) : (
          <p className="mt-4 text-[13px] text-success">Semua unit online sudah {LATEST_FIRMWARE}.</p>
        )}
      </div>

      <div className="px-5 py-4">
        <SubHeading>Kekuatan sinyal</SubHeading>
        <ul className="space-y-2">
          {signal.map((bucket, i) => (
            <li key={bucket.label} className="grid grid-cols-[88px_1fr_32px] items-center gap-3 text-[13px]">
              <span className="text-ink-2">{bucket.label}</span>
              <Meter value={bucket.count} max={signalTotal} tone={i === 3 ? "danger" : "neutral"} label={bucket.label} />
              <span className="tabular text-right text-muted">{bucket.count}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-5 py-4">
        <SubHeading>Status maintenance · {maintenanceTotal} unit</SubHeading>
        <ul className="space-y-2">
          {maintenance.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => onSelectDevice(d.id)}
                className="w-full rounded text-left text-[13px] leading-snug hover:text-ink"
              >
                <span className="font-medium text-ink">{d.id}</span>
                <span className="text-muted"> · {d.maintenanceNote}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
