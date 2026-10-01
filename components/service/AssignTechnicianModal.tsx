"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import type { ServiceTicket } from "@/types/service";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useReferenceData } from "@/components/providers/ReferenceDataProvider";
import { useTickets } from "@/components/providers/TicketProvider";
import { assignTechnician } from "@/lib/services/mutations";
import { SNAPSHOT_MS, formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

function isoDay(offsetDays: number) {
  return new Date(SNAPSHOT_MS + offsetDays * 86_400_000 + 7 * 3_600_000).toISOString().slice(0, 10);
}

export function AssignTechnicianModal({
  ticket,
  onClose,
}: {
  ticket: ServiceTicket | null;
  onClose: () => void;
}) {
  const { technicians, buildingById, technicianById } = useReferenceData();
  const { tickets, applyAssignment } = useTickets();
  const { notify } = useToast();

  const building = ticket ? buildingById.get(ticket.buildingId) : undefined;
  const recommended = building ? technicians.find((t) => t.cities.includes(building.city))?.id : undefined;

  const [technicianId, setTechnicianId] = useState<string>(ticket?.technicianId ?? recommended ?? technicians[0]?.id ?? "");
  const [visitDate, setVisitDate] = useState(isoDay(1));
  const [saving, setSaving] = useState(false);

  const load = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of tickets) {
      if (t.status !== "completed" && t.technicianId) map.set(t.technicianId, (map.get(t.technicianId) ?? 0) + 1);
    }
    return map;
  }, [tickets]);

  if (!ticket) return null;

  async function submit() {
    if (!ticket) return;
    setSaving(true);
    await assignTechnician(ticket.id, technicianId, `${visitDate}T09:00:00+07:00`);
    applyAssignment(ticket.id, technicianId, `${visitDate}T09:00:00+07:00`);
    setSaving(false);
    notify({
      tone: "success",
      title: `${technicianById.get(technicianId)?.name} ditugaskan ke ${ticket.deviceId}`,
      description: ticket.requiresVisit ? `Kunjungan ${formatDate(`${visitDate}T09:00:00+07:00`)}` : "Penanganan jarak jauh",
    });
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      locked={saving}
      title="Assign Technician"
      description={`${ticket.id} · ${ticket.deviceId} di ${building?.name ?? "—"}`}
      footer={
        <>
          <Button onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button variant="primary" onClick={submit} disabled={saving || !technicianId}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            Tugaskan
          </Button>
        </>
      }
    >
      <fieldset>
        <legend className="mb-2 text-[13px] font-medium text-ink-2">Teknisi</legend>
        <div className="divide-y divide-line rounded-md border border-line">
          {technicians.map((tech) => {
            const checked = technicianId === tech.id;
            return (
              <label
                key={tech.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 px-3.5 py-2.5",
                  checked ? "bg-accent-soft/60" : "hover:bg-sunken"
                )}
              >
                <input
                  type="radio"
                  name="technician"
                  value={tech.id}
                  checked={checked}
                  onChange={() => setTechnicianId(tech.id)}
                  className="size-4 accent-accent"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-[14px] font-medium text-ink">
                    {tech.name}
                    {tech.id === recommended ? (
                      <span className="rounded bg-accent-soft px-1.5 text-[11px] font-medium text-accent">Area sesuai</span>
                    ) : null}
                  </span>
                  <span className="block text-[12px] text-muted">{tech.area}</span>
                </span>
                <span className="tabular shrink-0 text-[12px] text-muted">{load.get(tech.id) ?? 0} tiket aktif</span>
              </label>
            );
          })}
        </div>
      </fieldset>
      {ticket.requiresVisit ? (
        <div className="mt-4">
          <label htmlFor="visit-date" className="mb-1.5 block text-[13px] font-medium text-ink-2">
            Tanggal kunjungan
          </label>
          <input
            id="visit-date"
            type="date"
            value={visitDate}
            min={isoDay(0)}
            onChange={(e) => setVisitDate(e.target.value)}
            className="h-9 w-full rounded-md border border-line-strong bg-surface px-3 text-[14px] focus:border-accent focus:outline-none"
          />
        </div>
      ) : null}
    </Modal>
  );
}
