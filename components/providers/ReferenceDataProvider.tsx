"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Building, Customer } from "@/types/building";
import type { Technician } from "@/types/service";
import type { Vendor } from "@/types/vendor";

export interface ReferenceData {
  buildings: Building[];
  customers: Customer[];
  technicians: Technician[];
  vendors: Vendor[];
}

interface ReferenceLookup extends ReferenceData {
  buildingById: Map<string, Building>;
  customerById: Map<string, Customer>;
  technicianById: Map<string, Technician>;
  vendorById: Map<string, Vendor>;
}

const ReferenceContext = createContext<ReferenceLookup | null>(null);

/** Data master kecil (gedung, pelanggan, teknisi, vendor) yang dipakai lintas halaman. */
export function ReferenceDataProvider({
  data,
  children,
}: {
  data: ReferenceData;
  children: ReactNode;
}) {
  const value = useMemo<ReferenceLookup>(
    () => ({
      ...data,
      buildingById: new Map(data.buildings.map((b) => [b.id, b])),
      customerById: new Map(data.customers.map((c) => [c.id, c])),
      technicianById: new Map(data.technicians.map((t) => [t.id, t])),
      vendorById: new Map(data.vendors.map((v) => [v.id, v])),
    }),
    [data]
  );
  return <ReferenceContext.Provider value={value}>{children}</ReferenceContext.Provider>;
}

export function useReferenceData(): ReferenceLookup {
  const context = useContext(ReferenceContext);
  if (!context) throw new Error("useReferenceData harus dipakai di dalam ReferenceDataProvider");
  return context;
}
