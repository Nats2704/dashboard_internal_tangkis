import { Panel, SectionHeader } from "@/components/ui/Panel";
import { UnitMapPanel } from "@/components/devices/UnitMapPanel";
import { cn } from "@/lib/utils/cn";

/** Peta fasilitas: satu lingkaran per gedung, ukurannya sebanding jumlah unit. */
export function FleetMapSection({ className }: { className?: string }) {
  return (
    <Panel labelledBy="sebaran-title" className={cn("flex flex-col", className)}>
      <SectionHeader
        id="sebaran-title"
        eyebrow="Lokasi"
        title="Peta fasilitas"
        description="Warna mengikuti status terburuk di tiap gedung. Klik lingkaran untuk melihat kondisi unitnya."
        flush
      />
      <UnitMapPanel className="flex flex-1 flex-col" />
    </Panel>
  );
}
