import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { Panel, SectionHeader } from "@/components/ui/Panel";
import { StatusLine } from "@/components/dashboard/StatusLine";
import { IncidentCard } from "@/components/alerts/IncidentCard";
import { AlertList, sortBySeverity } from "@/components/alerts/AlertList";
import { OfflineUnits } from "@/components/alerts/OfflineUnits";
import { getNotifications } from "@/lib/services/notificationService";
import { DATA_SNAPSHOT_AT } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Alarm" };

/** Antrean alarm: yang kritis sebagai kartu insiden, sisanya sebagai daftar. */
export default async function AlertsPage() {
  const notifications = sortBySeverity(await getNotifications());
  const critical = notifications.filter((n) => n.severity === "critical");
  const others = notifications.filter((n) => n.severity !== "critical");

  return (
    <PageContainer>
      <PageHeader
        eyebrow={<StatusLine notifications={notifications} />}
        title="Alarm"
        description="Alarm diturunkan dari kondisi data: unit, sensor, tiket, kontrak, ekonomi, dan firmware."
        meta={`Data per ${formatDateTime(DATA_SNAPSHOT_AT)}`}
      />
      <div className="grid items-start gap-4 lg:gap-5 xl:grid-cols-12">
        <section aria-label="Alarm kritis" className="space-y-4 xl:col-span-7">
          {critical.length === 0 ? (
            <Panel className="px-5 py-6 text-[13px] text-muted">Tidak ada alarm kritis.</Panel>
          ) : (
            critical.map((n) => (
              <IncidentCard key={n.id} notification={n}>
                {n.href.startsWith("/devices?status=offline") ? <OfflineUnits /> : null}
              </IncidentCard>
            ))
          )}
        </section>
        <Panel labelledBy="alarm-lain-title" className="xl:col-span-5">
          <SectionHeader
            id="alarm-lain-title"
            eyebrow="Antrean"
            title="Perhatian dan info"
            description={`${others.length} alarm, diurutkan dari yang paling berat.`}
          />
          <div className="border-t border-line">
            <AlertList notifications={others} />
          </div>
        </Panel>
      </div>
    </PageContainer>
  );
}
