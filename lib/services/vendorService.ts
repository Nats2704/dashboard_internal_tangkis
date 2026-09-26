import type { Vendor, VendorRequest } from "@/types/vendor";
import { mockVendorRequests, mockVendors } from "@/lib/mock-data/vendors";
import { load } from "./source";

export function getVendors(): Promise<Vendor[]> {
  return load("/vendors", () => mockVendors);
}

export function getVendorRequests(): Promise<VendorRequest[]> {
  return load("/vendor-requests", () => mockVendorRequests);
}
