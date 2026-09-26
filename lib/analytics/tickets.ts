import type { ServiceTicket, TicketCause, TicketSummary } from "@/types/service";

export function ticketTotalCost(ticket: ServiceTicket): number {
  const { transport, technician, material } = ticket.cost;
  return transport + technician + material;
}

export function summarizeTickets(tickets: ServiceTicket[]): TicketSummary {
  const visits = tickets.filter((t) => t.requiresVisit);
  const totalCost = tickets.reduce((sum, t) => sum + ticketTotalCost(t), 0);
  return {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    completed: tickets.filter((t) => t.status === "completed").length,
    visits: visits.length,
    totalCost,
    avgCostPerVisit: visits.length ? totalCost / visits.length : 0,
    unassignedHighPriority: tickets.filter(
      (t) =>
        t.status !== "completed" &&
        t.technicianId === null &&
        (t.priority === "high" || t.priority === "critical")
    ).length,
  };
}

export function costByCause(tickets: ServiceTicket[]) {
  const map = new Map<TicketCause, { count: number; cost: number }>();
  for (const t of tickets) {
    const entry = map.get(t.cause) ?? { count: 0, cost: 0 };
    entry.count += 1;
    entry.cost += ticketTotalCost(t);
    map.set(t.cause, entry);
  }
  return [...map.entries()]
    .map(([cause, v]) => ({ cause, ...v }))
    .sort((a, b) => b.cost - a.cost);
}
