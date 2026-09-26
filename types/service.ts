export type TicketStatus = "open" | "in_progress" | "completed";

export type TicketCause =
  | "cleaning"
  | "sensor_error"
  | "overheat"
  | "preventive"
  | "power_loss"
  | "connectivity";

export type TicketPriority = "low" | "medium" | "high" | "critical";

export interface Technician {
  id: string;
  name: string;
  area: string;
  /** Kota cakupan, dipakai untuk rekomendasi penugasan. */
  cities: string[];
  phone: string;
}

export interface TicketCost {
  transport: number;
  technician: number;
  material: number;
}

export interface ServiceTicket {
  id: string;
  deviceId: string;
  buildingId: string;
  createdAt: string;
  visitDate: string | null;
  problem: string;
  cause: TicketCause;
  priority: TicketPriority;
  status: TicketStatus;
  technicianId: string | null;
  requiresVisit: boolean;
  cost: TicketCost;
}

export interface TicketSummary {
  total: number;
  open: number;
  inProgress: number;
  completed: number;
  visits: number;
  totalCost: number;
  avgCostPerVisit: number;
  unassignedHighPriority: number;
}
