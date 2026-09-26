"use client";

import type { InventoryRecord } from "@/types/inventory";
import { Drawer } from "@/components/ui/Drawer";
import { Badge } from "@/components/ui/Badge";
import { DetailList, DrawerSection } from "@/components/ui/DetailList";
import { useFleet } from "@/components/providers/FleetProvider";
import { LIFECYCLE } from "@/lib/constants/status";
import { formatDate, formatDateTime } from "@/lib/utils/format";

const NEXT_STEP: Record<InventoryRecord["stage"], string> = {
  warehouse: "Siap dialokasikan ke instalasi berikutnya.",
  installed: "Beroperasi di lokasi pelanggan.",
  repair: "Kembali ke gudang setelah lolos uji fungsi, lalu dipasang ulang.",
  returned:
    "Periksa probe, baterai, dan enclosure. Jika lolos, unit masuk stok siap pasang dan bisa dipasang ulang di gedung lain.",
};

export function InventoryDetailDrawer({ record, onClose }: { record: InventoryRecord | null; onClose: () => void }) {
  const { deviceById } = useFleet();
  if (!record) return null;
  const device = deviceById.get(record.deviceId);
  const stage = LIFECYCLE[record.stage];

  return (
    <Drawer
      open
      onClose={onClose}
      title={record.deviceId}
      subtitle={record.location}
      headerExtra={
        <Badge tone={stage.tone} variant="soft">
          {stage.label}
        </Badge>
      }
    >
      <DrawerSection title="Status stok">
        <DetailList
          items={[
            { label: "Tahap", value: stage.label },
            { label: "Sejak", value: formatDate(record.since) },
            { label: "Nomor seri", value: device?.serial ?? "—", mono: true },
            { label: "Firmware", value: device?.firmware ?? "—" },
          ]}
        />
        <p className="mt-4 text-[13px] leading-relaxed text-ink-2">{record.note}</p>
      </DrawerSection>
      <DrawerSection title="Langkah berikutnya">
        <p className="text-[13px] leading-relaxed text-ink-2">{NEXT_STEP[record.stage]}</p>
      </DrawerSection>
      <DrawerSection title="Riwayat">
        <ol className="relative space-y-4 border-l border-line pl-5">
          {record.history.map((event) => (
            <li key={`${event.date}-${event.label}`} className="relative">
              <span className="absolute top-1.5 -left-[23.5px] size-2 rounded-full border-2 border-surface bg-ink-2/60" aria-hidden />
              <p className="text-[13px] text-ink">{event.label}</p>
              <p className="text-[12px] text-muted">{formatDateTime(event.date)}</p>
            </li>
          ))}
        </ol>
      </DrawerSection>
    </Drawer>
  );
}
