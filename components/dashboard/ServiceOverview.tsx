"use client";

import { useMemo } from "react";
import { useTickets } from "@/components/providers/TicketProvider";
import { summarizeTickets } from "@/lib/analytics/tickets";
import { SERVICE_PERIOD_LABEL } from "@/lib/constants";
import { formatRupiahShort } from "@/lib/utils/format";
import { Panel, SectionHeader } from "@/components/ui/Panel";
import { Metric } from "@/components/ui/Metric";
import { ServiceWorkspace } from "@/components/service/ServiceWorkspace";
import { CostByCause } from "@/components/service/CostByCause";

export function ServiceSummaryStrip() {
  const { tickets } = useTickets();
  const summary = useMemo(() => summarizeTickets(tickets), [tickets]);
  return (
    <div className="grid grid-cols-2 border-b border-line lg:grid-cols-4 [&>*]:px-5 [&>*]:py-4">
      <Metric label="Total Ticket" value={summary.total} hint={`${summary.open} open · ${summary.inProgress} in progress`} />
      <Metric
        className="border-l border-line"
        label="Kunjungan Lapangan"
        value={summary.visits}
        hint={`${summary.total - summary.visits} tiket selesai jarak jauh`}
      />
      <Metric
        className="border-t border-line lg:border-t-0 lg:border-l"
        label="Total Biaya"
        value={formatRupiahShort(summary.totalCost)}
        hint={`${formatRupiahShort(summary.avgCostPerVisit)} per kunjungan`}
      />
      <Metric
        className="border-t border-l border-line lg:border-t-0"
        label="Prioritas tinggi tanpa teknisi"
        value={summary.unassignedHighPriority}
        tone={summary.unassignedHighPriority ? "danger" : "success"}
        hint={summary.unassignedHighPriority ? "Tugaskan dari detail tiket" : "Semua sudah ditangani"}
      />
    </div>
  );
}

export function ServiceOverview() {
  const { tickets } = useTickets();
  return (
    <Panel id="tiket-servis" labelledBy="tiket-servis-title">
      <SectionHeader
        id="tiket-servis-title"
        eyebrow="Maintenance"
        title="Tiket servis dan kunjungan lapangan"
        description={SERVICE_PERIOD_LABEL}
        href="/service"
        linkLabel="Lihat semua tiket"
      />
      <ServiceSummaryStrip />
      <div className="grid xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 border-b border-line xl:border-r xl:border-b-0">
          <ServiceWorkspace pageSize={7} />
        </div>
        <div className="px-5 py-4">
          <CostByCause tickets={tickets} />
        </div>
      </div>
    </Panel>
  );
}
