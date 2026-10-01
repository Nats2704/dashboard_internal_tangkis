import type { AppNotification } from "@/types/notification";
import { Panel, SectionHeader } from "@/components/ui/Panel";
import { IncidentCard } from "@/components/alerts/IncidentCard";
import { AlertList, sortBySeverity } from "@/components/alerts/AlertList";
import { cn } from "@/lib/utils/cn";

/** Alarm utama yang diangkat jadi kartu insiden: kritis dan menyangkut satu unit lebih dulu. */
export function pickPrimaryAlert(notifications: AppNotification[]): AppNotification | undefined {
  return (
    notifications.find((n) => n.severity === "critical" && n.deviceId) ??
    notifications.find((n) => n.severity === "critical") ??
    notifications[0]
  );
}

/**
 * Titik fokus Beranda: insiden terpenting ditampilkan lebar dengan telemetri,
 * antrean alarm lain di sebelahnya.
 */
export function ActiveAlerts({
  notifications,
  limit = 4,
  className,
}: {
  notifications: AppNotification[];
  limit?: number;
  className?: string;
}) {
  const primary = pickPrimaryAlert(notifications);
  const rest = sortBySeverity(notifications.filter((n) => n.id !== primary?.id));
  const shown = rest.slice(0, limit);
  const critical = notifications.filter((n) => n.severity === "critical").length;
  const warning = notifications.filter((n) => n.severity === "warning").length;

  return (
    <Panel labelledBy="alarm-title" className={className}>
      <SectionHeader
        id="alarm-title"
        eyebrow="Perlu tindakan"
        title="Alarm aktif"
        description={
          <>
            <span className="text-danger">{critical} kritis</span> · <span className="text-warning">{warning} perhatian</span> ·{" "}
            {notifications.length} total, diurutkan dari yang paling berat
          </>
        }
        href="/alerts"
        linkLabel="Semua alarm"
      />
      {primary ? (
        <div className="grid gap-4 px-4 pb-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <IncidentCard notification={primary} />
          {shown.length > 0 ? (
            <div className="flex flex-col overflow-hidden rounded-lg border border-line bg-sunken/40">
              <p className="eyebrow border-b border-line px-5 py-2.5 text-[10.5px]">Antrean alarm</p>
              <AlertList notifications={shown} className="flex-1" />
              {rest.length > shown.length ? (
                <p className="border-t border-line/70 px-5 py-2.5 text-[12px] text-muted">
                  +{rest.length - shown.length} alarm lain di halaman Alarm
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : (
        <p className={cn("px-5 pb-6 text-[13px] text-muted")}>Tidak ada alarm aktif.</p>
      )}
    </Panel>
  );
}
