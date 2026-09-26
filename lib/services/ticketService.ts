import type { ServiceTicket, Technician } from "@/types/service";
import { mockTechnicians, mockTickets } from "@/lib/mock-data/tickets";
import { load } from "./source";

export function getTickets(): Promise<ServiceTicket[]> {
  return load("/tickets?period=2026-Q3", () => mockTickets);
}

export function getTechnicians(): Promise<Technician[]> {
  return load("/technicians", () => mockTechnicians);
}
