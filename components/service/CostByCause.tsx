import type { ServiceTicket } from "@/types/service";
import { costByCause } from "@/lib/analytics/tickets";
import { TICKET_CAUSE } from "@/lib/constants/status";
import { formatRupiahShort } from "@/lib/utils/format";
import { Meter } from "@/components/ui/Meter";
import { SubHeading } from "@/components/ui/Panel";

export function CostByCause({ tickets }: { tickets: ServiceTicket[] }) {
  const rows = costByCause(tickets);
  const max = Math.max(...rows.map((r) => r.cost), 1);
  return (
    <div>
      <SubHeading>Biaya per penyebab</SubHeading>
      <ul className="space-y-3">
        {rows.map((row, index) => (
          <li key={row.cause}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-[13px]">
              <span className="text-ink-2">
                {TICKET_CAUSE[row.cause]} <span className="text-[12px] text-subtle">· {row.count} tiket</span>
              </span>
              <span className="tabular font-medium text-ink">{formatRupiahShort(row.cost)}</span>
            </div>
            <Meter value={row.cost} max={max} tone={index === 0 ? "accent" : "neutral"} label={TICKET_CAUSE[row.cause]} />
          </li>
        ))}
      </ul>
    </div>
  );
}
