import Link from "next/link";
import type { VendorRequest } from "@/types/vendor";
import { summarizeVendorRequests } from "@/lib/analytics/vendors";
import { formatRupiahShort } from "@/lib/utils/format";
import { Panel, SectionHeader } from "@/components/ui/Panel";
import { Metric } from "@/components/ui/Metric";
import { buttonClasses } from "@/components/ui/Button";
import { VendorWorkspace } from "@/components/vendors/VendorWorkspace";

export function VendorSummaryStrip({ requests }: { requests: VendorRequest[] }) {
  const summary = summarizeVendorRequests(requests);
  return (
    <div className="grid grid-cols-2 border-b border-line [&>*]:px-5 [&>*]:py-4">
      <Metric label="Komisi diterima" value={formatRupiahShort(summary.commissionEarned)} hint={`${summary.done} rujukan selesai`} />
      <Metric
        className="border-l border-line"
        label="Komisi dalam proses"
        value={formatRupiahShort(summary.commissionPipeline)}
        hint={`${summary.waiting} menunggu · ${summary.inProgress} dikerjakan`}
      />
    </div>
  );
}

export function VendorOverview({ requests }: { requests: VendorRequest[] }) {
  return (
    <Panel id="vendor" labelledBy="vendor-title" className="flex flex-col">
      <SectionHeader
        id="vendor-title"
        title="Rujukan Vendor"
        description="Pekerjaan yang dirujuk ke mitra, dengan komisi untuk TANGKIS."
        actions={
          <Link href="/vendors" className={buttonClasses("secondary", "sm")}>
            Lihat semua
          </Link>
        }
      />
      <VendorSummaryStrip requests={requests} />
      <VendorWorkspace requests={requests} pageSize={6} />
    </Panel>
  );
}
