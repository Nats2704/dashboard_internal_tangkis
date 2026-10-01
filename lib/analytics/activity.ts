import type { Device } from "@/types/device";
import type { InventoryRecord } from "@/types/inventory";
import type { ServiceTicket } from "@/types/service";
import type { VendorRequest } from "@/types/vendor";
import { TICKET_CAUSE, VENDOR_SERVICE, type Tone } from "@/lib/constants/status";
import { SNAPSHOT_MS } from "@/lib/utils/format";

export type ActivityKind = "offline" | "ticket" | "visit" | "vendor" | "vendor_done" | "workshop" | "returned" | "receipt";

export interface ActivityEvent {
  id: string;
  at: string;
  kind: ActivityKind;
  title: string;
  subject: string;
  tone: Tone;
  href: string;
}

const PRIORITY_TONE: Record<ServiceTicket["priority"], Tone> = {
  critical: "danger",
  high: "warning",
  medium: "info",
  low: "neutral",
};

/**
 * Aliran kejadian operasional terbaru, dirangkai dari data yang sudah ada:
 * unit berhenti melapor, tiket, kunjungan, rujukan vendor, dan mutasi stok.
 * Hanya kejadian sampai waktu snapshot yang ditampilkan.
 */
export function buildActivityFeed({
  devices,
  tickets,
  vendorRequests,
  inventory,
  buildingName,
  vendorName,
  limit = 12,
  maxOffline = 3,
  now = SNAPSHOT_MS,
}: {
  devices: Device[];
  tickets: ServiceTicket[];
  vendorRequests: VendorRequest[];
  inventory: InventoryRecord[];
  buildingName: (id: string | null) => string;
  vendorName: (id: string) => string;
  limit?: number;
  /** Batas kejadian "berhenti melapor" supaya log tidak didominasi satu jenis. */
  maxOffline?: number;
  now?: number;
}): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  for (const d of devices) {
    if (d.connectivity === "offline" && d.lastSeen) {
      events.push({
        id: `off-${d.id}`,
        at: d.lastSeen,
        kind: "offline",
        title: "Unit berhenti mengirim data",
        subject: `${d.id} · ${buildingName(d.buildingId)}`,
        tone: "danger",
        href: `/devices?unit=${encodeURIComponent(d.id)}`,
      });
    }
  }

  for (const t of tickets) {
    events.push({
      id: `tkt-${t.id}`,
      at: t.createdAt,
      kind: "ticket",
      title: `Tiket ${TICKET_CAUSE[t.cause].toLowerCase()}: ${t.problem}`,
      subject: `${t.deviceId} · ${buildingName(t.buildingId)}`,
      tone: PRIORITY_TONE[t.priority],
      href: `/service?ticket=${t.id}`,
    });
    if (t.status === "completed" && t.visitDate) {
      events.push({
        id: `vst-${t.id}`,
        at: t.visitDate,
        kind: "visit",
        title: "Kunjungan teknisi selesai",
        subject: `${t.deviceId} · ${buildingName(t.buildingId)}`,
        tone: "success",
        href: `/service?ticket=${t.id}`,
      });
    }
  }

  for (const r of vendorRequests) {
    events.push({
      id: `vnd-${r.id}`,
      at: r.requestedAt,
      kind: "vendor",
      title: `Rujukan ${VENDOR_SERVICE[r.service]} ke ${vendorName(r.vendorId)}`,
      subject: `${r.deviceId} · ${buildingName(r.buildingId)}`,
      tone: "info",
      href: "/vendors",
    });
    if (r.completedAt) {
      events.push({
        id: `vnd-done-${r.id}`,
        at: r.completedAt,
        kind: "vendor_done",
        title: `${VENDOR_SERVICE[r.service]} oleh vendor selesai`,
        subject: `${r.deviceId} · ${buildingName(r.buildingId)}`,
        tone: "success",
        href: "/vendors",
      });
    }
  }

  for (const rec of inventory) {
    if (rec.stage === "repair") {
      events.push({
        id: `inv-${rec.deviceId}`,
        at: rec.since,
        kind: "workshop",
        title: "Unit dikirim ke workshop",
        subject: `${rec.deviceId} · ${rec.note}`,
        tone: "warning",
        href: "/inventory?stage=repair",
      });
    } else if (rec.stage === "returned") {
      events.push({
        id: `inv-${rec.deviceId}`,
        at: rec.since,
        kind: "returned",
        title: "Unit tarikan diterima di gudang",
        subject: rec.deviceId,
        tone: "neutral",
        href: "/inventory?stage=returned",
      });
    }
  }

  const sorted = events
    .filter((e) => Date.parse(e.at) <= now)
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  let offline = 0;
  return sorted
    .filter((e) => e.kind !== "offline" || ++offline <= maxOffline)
    .slice(0, limit);
}
