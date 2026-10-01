"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTickets } from "@/components/providers/TicketProvider";
import { Panel, SectionHeader } from "@/components/ui/Panel";
import { SearchInput } from "@/components/ui/SearchInput";
import { ServiceSummaryStrip } from "@/components/dashboard/ServiceOverview";
import { SERVICE_PERIOD_LABEL } from "@/lib/constants";
import { CostByCause } from "./CostByCause";
import { ServiceWorkspace, type TicketFilter } from "./ServiceWorkspace";
import { TechnicianLoad } from "./TechnicianLoad";

const VALID: TicketFilter[] = ["all", "open", "in_progress", "completed"];

export function ServiceView() {
  const params = useSearchParams();
  const { tickets } = useTickets();
  const [query, setQuery] = useState("");
  const status = params.get("status") as TicketFilter | null;

  return (
    <div className="space-y-4 lg:space-y-5">
      <Panel labelledBy="ringkasan-servis">
        <SectionHeader id="ringkasan-servis" title="Ringkasan" description={SERVICE_PERIOD_LABEL} />
        <ServiceSummaryStrip />
        {/* Dua kolom di xl, bertumpuk di layar kecil. */}
        <div className="grid xl:grid-cols-2">
          <div className="border-b border-line px-5 py-4 xl:border-r xl:border-b-0">
            <CostByCause tickets={tickets} />
          </div>
          <div className="px-5 py-4">
            <TechnicianLoad />
          </div>
        </div>
      </Panel>
      <Panel labelledBy="daftar-tiket">
        <SectionHeader
          id="daftar-tiket"
          title="Daftar tiket"
          description="Tiket open tampil lebih dulu. Klik baris untuk detail biaya dan penugasan teknisi."
          actions={<SearchInput value={query} onChange={setQuery} placeholder="Cari tiket, unit, atau masalah" label="Cari tiket" />}
        />
        <ServiceWorkspace
          key={params.toString()}
          pageSize={15}
          initialFilter={status && VALID.includes(status) ? status : "all"}
          initialTicketId={params.get("ticket")}
          query={query}
        />
      </Panel>
    </div>
  );
}
