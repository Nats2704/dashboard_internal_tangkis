import type { AppNotification } from "@/types/notification";
import { Panel, SectionHeader } from "@/components/ui/Panel";
import { UnitMapPanel } from "@/components/devices/UnitMapPanel";
import { NotificationsPanel } from "./NotificationsPanel";

export function FleetMapSection({ notifications }: { notifications: AppNotification[] }) {
  return (
    <Panel labelledBy="sebaran-title">
      <div className="grid xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col border-b border-line xl:border-r xl:border-b-0">
          <SectionHeader
            id="sebaran-title"
            title="Sebaran Unit"
            description="Klik lingkaran untuk melihat kondisi unit di gedung tersebut."
            className="border-b-0 pb-0"
          />
          <UnitMapPanel className="flex flex-1 flex-col" />
        </div>
        <NotificationsPanel notifications={notifications} />
      </div>
    </Panel>
  );
}
