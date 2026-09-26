"use client";

import Link from "next/link";
import type { ServiceTicket } from "@/types/service";
import { Drawer } from "@/components/ui/Drawer";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { DetailList, DrawerSection } from "@/components/ui/DetailList";
import { useReferenceData } from "@/components/providers/ReferenceDataProvider";
import { TICKET_CAUSE, TICKET_PRIORITY, TICKET_STATUS } from "@/lib/constants/status";
import { ticketTotalCost } from "@/lib/analytics/tickets";
import { formatDate, formatDateTime, formatRupiah } from "@/lib/utils/format";

interface TicketDetailDrawerProps {
  ticket: ServiceTicket | null;
  onClose: () => void;
  onAssign: (ticket: ServiceTicket) => void;
}

export function TicketDetailDrawer({ ticket, onClose, onAssign }: TicketDetailDrawerProps) {
  const { buildingById, technicianById } = useReferenceData();
  if (!ticket) return null;

  const technician = ticket.technicianId ? technicianById.get(ticket.technicianId) : undefined;
  const status = TICKET_STATUS[ticket.status];
  const priority = TICKET_PRIORITY[ticket.priority];
  const costRows = [
    ["Biaya Transport", ticket.cost.transport],
    ["Biaya Teknisi", ticket.cost.technician],
    ["Biaya Material", ticket.cost.material],
  ] as const;

  return (
    <Drawer
      open
      onClose={onClose}
      title={ticket.id}
      subtitle={`${ticket.deviceId} · ${buildingById.get(ticket.buildingId)?.name ?? ""}`}
      headerExtra={
        <div className="flex flex-wrap gap-2">
          <Badge tone={status.tone} variant="soft">
            {status.label}
          </Badge>
          <Badge tone={priority.tone} variant="soft">
            Prioritas {priority.label.toLowerCase()}
          </Badge>
        </div>
      }
      footer={
        <>
          <Link href={`/devices?unit=${ticket.deviceId}`} className={buttonClasses("ghost", "md")}>
            Lihat unit
          </Link>
          <Button variant="primary" onClick={() => onAssign(ticket)} disabled={ticket.status === "completed"}>
            {technician ? "Ganti teknisi" : "Assign Technician"}
          </Button>
        </>
      }
    >
      <DrawerSection title="Masalah">
        <p className="text-[14px] leading-relaxed text-ink">{ticket.problem}</p>
        <p className="mt-1 text-[12.5px] text-muted">Dilaporkan {formatDateTime(ticket.createdAt)}</p>
      </DrawerSection>
      <DrawerSection title="Penanganan">
        <DetailList
          items={[
            { label: "Ticket ID", value: ticket.id, mono: true },
            { label: "Unit", value: ticket.deviceId, mono: true },
            { label: "Gedung", value: buildingById.get(ticket.buildingId)?.name ?? "—" },
            { label: "Penyebab", value: TICKET_CAUSE[ticket.cause] },
            { label: "Priority", value: priority.label },
            {
              label: "Technician",
              value: technician ? technician.name : <span className="text-danger">Belum ditugaskan</span>,
            },
            {
              label: "Tanggal Visit",
              value: ticket.requiresVisit ? formatDate(ticket.visitDate) : "Tidak perlu kunjungan",
            },
            { label: "Kontak teknisi", value: technician?.phone ?? "—" },
          ]}
        />
      </DrawerSection>
      <DrawerSection title="Biaya">
        {ticket.requiresVisit ? (
          <dl className="text-[13.5px]">
            {costRows.map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-line/70 py-2">
                <dt className="text-muted">{label}</dt>
                <dd className="tabular">{formatRupiah(value)}</dd>
              </div>
            ))}
            <div className="flex justify-between pt-2.5">
              <dt className="font-medium">Total Biaya</dt>
              <dd className="tabular font-semibold">{formatRupiah(ticketTotalCost(ticket))}</dd>
            </div>
            {ticket.status === "open" ? (
              <p className="mt-2 text-[12px] text-muted">Angka masih estimasi sampai kunjungan selesai.</p>
            ) : null}
          </dl>
        ) : (
          <p className="text-[13px] text-muted">Ditangani jarak jauh, tanpa biaya kunjungan.</p>
        )}
      </DrawerSection>
    </Drawer>
  );
}
