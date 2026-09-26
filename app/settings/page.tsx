import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { Panel, SectionHeader } from "@/components/ui/Panel";
import { DetailList } from "@/components/ui/DetailList";
import {
  CALIBRATION_THRESHOLD_PCT,
  COST_ASSUMPTION_PER_UNIT_YEAR,
  LATEST_FIRMWARE,
  LOW_BATTERY_PCT,
  OFFLINE_THRESHOLD_HOURS,
  REPORT_INTERVAL_MINUTES,
  VARIANCE_DEVIATION_PCT,
  VARIANCE_WARNING_PCT,
  WARRANTY_ALERT_DAYS,
  WEAK_SIGNAL_DBM,
} from "@/lib/constants";
import { DATA_SOURCE } from "@/lib/services/source";
import { formatRupiah } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Pengaturan" };

export default function SettingsPage() {
  return (
    <PageContainer narrow>
      <PageHeader title="Pengaturan" description="Ambang alarm dan asumsi yang dipakai di seluruh dashboard." />
      <div className="space-y-12">
        <Panel labelledBy="ambang-title">
          <SectionHeader id="ambang-title" title="Ambang alarm" description="Diubah lewat konfigurasi backend. Halaman ini hanya menampilkan nilai aktif." />
          <div className="px-5 py-5">
            <DetailList
              items={[
                { label: "Interval kirim data", value: `${REPORT_INTERVAL_MINUTES} menit` },
                { label: "Unit dianggap offline setelah", value: `${OFFLINE_THRESHOLD_HOURS} jam tanpa data` },
                { label: "Sinyal lemah", value: `di bawah ${WEAK_SIGNAL_DBM} dBm` },
                { label: "Baterai cadangan rendah", value: `di bawah ${LOW_BATTERY_PCT}%` },
                { label: "Sensor perlu kalibrasi", value: `selisih vs lab di atas ${CALIBRATION_THRESHOLD_PCT}%` },
                { label: "Peringatan garansi", value: `${WARRANTY_ALERT_DAYS} hari sebelum habis` },
                { label: "Firmware rilis terbaru", value: LATEST_FIRMWARE },
              ]}
            />
          </div>
        </Panel>
        <Panel labelledBy="ekonomi-title">
          <SectionHeader id="ekonomi-title" title="Asumsi ekonomi" />
          <div className="px-5 py-5">
            <DetailList
              items={[
                { label: "Asumsi biaya layanan", value: `${formatRupiah(COST_ASSUMPTION_PER_UNIT_YEAR)} per unit per tahun` },
                { label: "Batas menyimpang", value: `lebih dari +${VARIANCE_DEVIATION_PCT}%` },
                { label: "Batas perlu evaluasi", value: `lebih dari +${VARIANCE_WARNING_PCT}%` },
              ]}
            />
          </div>
        </Panel>
        <Panel labelledBy="sumber-title">
          <SectionHeader id="sumber-title" title="Sumber data" />
          <div className="px-5 py-5 text-[14px] text-ink-2">
            <p>
              Mode saat ini: <span className="font-semibold text-ink">{DATA_SOURCE === "mock" ? "Data contoh (mock)" : "API backend"}</span>
            </p>
            <p className="mt-1.5 text-muted">
              Set <code className="rounded bg-black/[0.05] px-1 py-0.5 font-mono text-[13px]">TANGKIS_DATA_SOURCE=api</code> dan{" "}
              <code className="rounded bg-black/[0.05] px-1 py-0.5 font-mono text-[13px]">TANGKIS_API_URL</code> untuk beralih ke backend.
            </p>
          </div>
        </Panel>
      </div>
    </PageContainer>
  );
}
