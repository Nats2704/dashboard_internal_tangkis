"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useReferenceData } from "@/components/providers/ReferenceDataProvider";
import { useTickets } from "@/components/providers/TicketProvider";
import { summarizeTickets } from "@/lib/analytics/tickets";
import { cn } from "@/lib/utils/cn";
import { Meter } from "@/components/ui/Meter";
import { SubHeading } from "@/components/ui/Panel";

/** Tiket aktif per teknisi, ditambah tiket prioritas tinggi yang belum punya teknisi. */
export function TechnicianLoad() {
  const { technicians } = useReferenceData();
  const { tickets } = useTickets();

  const rows = useMemo(() => {
    // Tiket aktif = belum completed, sama dengan hitungan di AssignTechnicianModal.
    const load = new Map<string, number>();
    for (const t of tickets) {
      if (t.status !== "completed" && t.technicianId) load.set(t.technicianId, (load.get(t.technicianId) ?? 0) + 1);
    }
    return technicians
      .map((tech) => ({ tech, active: load.get(tech.id) ?? 0 }))
      .sort((a, b) => b.active - a.active || a.tech.name.localeCompare(b.tech.name, "id"));
  }, [technicians, tickets]);

  const unassigned = useMemo(() => summarizeTickets(tickets).unassignedHighPriority, [tickets]);
  const max = Math.max(...rows.map((r) => r.active), 1);

  return (
    <div>
      <SubHeading>Beban teknisi</SubHeading>
      <ul className="space-y-3">
        {rows.map(({ tech, active }) => (
          <li key={tech.id}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-[13px]">
              <span className="min-w-0 truncate text-ink-2">
                {tech.name} <span className="text-[12px] text-subtle">· {tech.area}</span>
              </span>
              <span className="tabular shrink-0 font-medium text-ink">
                {active} <span className="text-[12px] font-normal text-muted">aktif</span>
              </span>
            </div>
            <Meter
              value={active}
              max={max}
              // Semua teknisi dengan beban tertinggi disorot, bukan hanya baris pertama.
              tone={active === max && active > 0 ? "accent" : "neutral"}
              label={`${tech.name}: ${active} tiket aktif`}
            />
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-line pt-3 text-[13px]">
        <p className={cn("tabular", unassigned > 0 ? "text-danger" : "text-success")}>
          {unassigned > 0
            ? `${unassigned} tiket prioritas tinggi/kritis belum ditugaskan`
            : "Semua tiket prioritas tinggi/kritis sudah ditugaskan"}
        </p>
        <Link
          href="/service?status=open"
          className="group inline-flex items-center gap-1 rounded text-[12.5px] font-medium text-accent hover:text-accent-strong"
        >
          Lihat tiket open
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-px" />
        </Link>
      </div>
    </div>
  );
}
