"use client";

import Link from "next/link";
import type { Sensor, SensorStatus } from "@/types/sensor";
import { Drawer } from "@/components/ui/Drawer";
import { Badge } from "@/components/ui/Badge";
import { DetailList, DrawerSection } from "@/components/ui/DetailList";
import { buttonClasses } from "@/components/ui/Button";
import { useReferenceData } from "@/components/providers/ReferenceDataProvider";
import { SENSOR_KIND, SENSOR_STATUS } from "@/lib/constants/status";
import { CALIBRATION_THRESHOLD_PCT } from "@/lib/constants";
import { formatDate, formatRelative } from "@/lib/utils/format";
import { formatReading } from "@/components/devices/DeviceDetailDrawer";
import { DeviationValue } from "./SensorTable";

const EXPLANATION: Record<SensorStatus, (s: Sensor) => string> = {
  normal: () =>
    `Pembacaan berubah wajar dan selisih terhadap lab masih di bawah ambang ${CALIBRATION_THRESHOLD_PCT}%.`,
  stuck: (s) =>
    `Nilai tidak berubah selama ${s.stuckHours} jam padahal unit tetap mengirim data. Biasanya probe tertutup endapan atau kabel putus.`,
  out_of_range: () =>
    "Nilai berada di luar batas fisik yang mungkin, sehingga tidak dipakai untuk perhitungan kesiapan BBM.",
  calibration: () =>
    `Selisih terhadap sampel lab terakhir melewati ambang ${CALIBRATION_THRESHOLD_PCT}%. Jadwalkan kalibrasi ulang.`,
  no_data: () => "Unit sedang offline, pembacaan terakhir yang diterima ditampilkan sebagai acuan.",
};

export function SensorDetailDrawer({ sensor, onClose }: { sensor: Sensor | null; onClose: () => void }) {
  const { buildingById } = useReferenceData();
  if (!sensor) return null;
  const status = SENSOR_STATUS[sensor.status];

  return (
    <Drawer
      open
      onClose={onClose}
      title={sensor.id}
      subtitle={`${SENSOR_KIND[sensor.kind].label} · ${buildingById.get(sensor.buildingId)?.name ?? ""}`}
      headerExtra={
        <Badge tone={status.tone} variant="soft">
          {status.label}
        </Badge>
      }
      footer={
        <Link href={`/devices?unit=${sensor.deviceId}`} className={buttonClasses("secondary", "md")}>
          Lihat unit {sensor.deviceId}
        </Link>
      }
    >
      <div className="border-b border-line px-6 py-4 text-[13px] leading-relaxed text-ink-2">
        {EXPLANATION[sensor.status](sensor)}
      </div>
      <DrawerSection title="Pembacaan">
        <DetailList
          items={[
            { label: "Current reading", value: formatReading(sensor, sensor.currentReading) },
            { label: "Last reading", value: formatReading(sensor, sensor.lastReading) },
            { label: "Hasil lab", value: formatReading(sensor, sensor.labResult) },
            { label: "Selisih", value: <DeviationValue value={sensor.deviationPct} /> },
          ]}
        />
      </DrawerSection>
      <DrawerSection title="Identitas & kalibrasi">
        <DetailList
          items={[
            { label: "Sensor ID", value: sensor.id, mono: true },
            { label: "Device", value: sensor.deviceId, mono: true },
            { label: "Gedung", value: buildingById.get(sensor.buildingId)?.name ?? "—" },
            { label: "Status", value: <Badge tone={status.tone}>{status.label}</Badge> },
            { label: "Kalibrasi terakhir", value: `${formatDate(sensor.lastCalibration)} · ${formatRelative(sensor.lastCalibration)}` },
            { label: "Sampel lab terakhir", value: formatDate(sensor.lastLabSample) },
          ]}
        />
      </DrawerSection>
    </Drawer>
  );
}
