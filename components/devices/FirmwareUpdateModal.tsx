"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { Device } from "@/types/device";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Meter } from "@/components/ui/Meter";
import { useToast } from "@/components/ui/Toast";
import { useFleet } from "@/components/providers/FleetProvider";
import { useReferenceData } from "@/components/providers/ReferenceDataProvider";
import { isOutdated } from "@/lib/analytics/devices";
import { LATEST_FIRMWARE } from "@/lib/constants";
import { simulateFirmwareRollout, type RolloutHandle } from "@/lib/services/mutations";
import { cn } from "@/lib/utils/cn";

type Phase = "review" | "running" | "done";

interface FirmwareUpdateModalProps {
  open: boolean;
  onClose: () => void;
  onUpdated?: (ids: string[]) => void;
}

export function FirmwareUpdateModal({ open, onClose, onUpdated }: FirmwareUpdateModalProps) {
  const { devices, applyFirmware } = useFleet();
  const { buildingById } = useReferenceData();
  const { notify } = useToast();
  const [phase, setPhase] = useState<Phase>("review");
  const [completed, setCompleted] = useState<string[]>([]);
  // Target dikunci saat modal dibuka agar daftar tidak berubah selama proses.
  const [targets, setTargets] = useState<Device[]>([]);
  const handleRef = useRef<RolloutHandle | null>(null);

  const liveTargets = useMemo(
    () => devices.filter((d) => d.lifecycle === "installed" && d.connectivity === "online" && isOutdated(d)),
    [devices]
  );
  const waiting = useMemo(
    () => devices.filter((d) => d.lifecycle === "installed" && d.connectivity !== "online" && isOutdated(d)),
    [devices]
  );

  const list = phase === "review" ? liveTargets : targets;
  const versions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const d of list) counts.set(d.firmware, (counts.get(d.firmware) ?? 0) + 1);
    return [...counts.entries()];
  }, [list]);

  useEffect(() => () => handleRef.current?.cancel(), []);

  function start() {
    const snapshot = liveTargets;
    const ids = snapshot.map((d) => d.id);
    setTargets(snapshot);
    setCompleted([]);
    setPhase("running");
    handleRef.current = simulateFirmwareRollout(
      ids,
      (done) => {
        setCompleted(done);
        applyFirmware(done, LATEST_FIRMWARE);
      },
      () => {
        setPhase("done");
        onUpdated?.(ids);
        notify({
          tone: "success",
          title: `${ids.length} unit kini menjalankan ${LATEST_FIRMWARE}`,
          description: "Semua unit kembali melapor setelah reboot.",
        });
      }
    );
  }

  function close() {
    if (phase === "running") return;
    setPhase("review");
    setCompleted([]);
    onClose();
  }

  const doneSet = new Set(completed);
  const total = list.length;

  return (
    <Modal
      open={open}
      onClose={close}
      locked={phase === "running"}
      title="Update firmware"
      description={
        phase === "done"
          ? "Pembaruan selesai."
          : "Pembaruan dikirim jarak jauh (OTA) bertahap, unit reboot sekitar 40 detik."
      }
      footer={
        phase === "review" ? (
          <>
            <Button onClick={close}>Batal</Button>
            <Button variant="primary" onClick={start} disabled={liveTargets.length === 0}>
              Mulai Update
            </Button>
          </>
        ) : phase === "running" ? (
          <Button disabled>
            <Loader2 className="size-4 animate-spin" /> Memperbarui…
          </Button>
        ) : (
          <Button variant="primary" onClick={close}>
            Selesai
          </Button>
        )
      }
    >
      <dl className="grid grid-cols-3 gap-4 rounded-md border border-line bg-sunken px-4 py-3">
        <div>
          <dt className="text-[12px] text-muted">Firmware saat ini</dt>
          <dd className="tabular mt-0.5 text-[14px] font-medium">
            {versions.length ? versions.map(([v, c]) => `${v} (${c})`).join(", ") : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[12px] text-muted">Firmware baru</dt>
          <dd className="tabular mt-0.5 text-[14px] font-medium text-accent">{LATEST_FIRMWARE}</dd>
        </div>
        <div>
          <dt className="text-[12px] text-muted">Target</dt>
          <dd className="tabular mt-0.5 text-[14px] font-medium">{total} unit</dd>
        </div>
      </dl>

      {phase !== "review" ? (
        <div className="mt-5">
          <div className="mb-2 flex items-baseline justify-between">
            <p className="text-[13px] font-medium">
              {phase === "done" ? "Selesai" : "Mengirim pembaruan"}
            </p>
            <p className="tabular text-[20px] font-semibold tracking-tight" aria-live="polite">
              {completed.length} <span className="text-[14px] font-normal text-muted">/ {total}</span>
            </p>
          </div>
          <Meter value={completed.length} max={total || 1} tone="accent" label="Progres pembaruan" />
        </div>
      ) : null}

      <ul className="scrollbar-thin mt-5 max-h-[220px] divide-y divide-line overflow-y-auto rounded-md border border-line">
        {list.map((device) => {
          const done = doneSet.has(device.id);
          const active = phase === "running" && !done;
          return (
            <li key={device.id} className="flex items-center justify-between gap-3 px-3.5 py-2 text-[13px]">
              <span className="min-w-0">
                <span className="font-medium text-ink">{device.id}</span>
                <span className="ml-2 text-muted">
                  {buildingById.get(device.buildingId ?? "")?.name}
                </span>
              </span>
              <span
                className={cn(
                  "tabular flex shrink-0 items-center gap-1.5 text-[13px]",
                  done ? "text-success" : active ? "text-muted" : "text-subtle"
                )}
              >
                {done ? (
                  <>
                    <CheckCircle2 className="size-3.5" /> {LATEST_FIRMWARE}
                  </>
                ) : active ? (
                  "Menunggu giliran"
                ) : (
                  device.firmware
                )}
              </span>
            </li>
          );
        })}
      </ul>

      {waiting.length > 0 ? (
        <p className="mt-3 text-[13px] text-muted">
          {waiting.length} unit lain juga masih firmware lama tetapi sedang offline (
          {waiting.map((d) => d.id).join(", ")}). Pembaruan otomatis dikirim saat unit kembali online.
        </p>
      ) : null}
    </Modal>
  );
}
