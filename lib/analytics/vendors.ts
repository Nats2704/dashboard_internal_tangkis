import type { VendorRequest, VendorSummary } from "@/types/vendor";

export function summarizeVendorRequests(requests: VendorRequest[]): VendorSummary {
  const done = requests.filter((r) => r.status === "done");
  const pending = requests.filter((r) => r.status !== "done");
  return {
    total: requests.length,
    waiting: requests.filter((r) => r.status === "waiting").length,
    inProgress: requests.filter((r) => r.status === "in_progress").length,
    done: done.length,
    commissionEarned: done.reduce((sum, r) => sum + r.commission, 0),
    commissionPipeline: pending.reduce((sum, r) => sum + r.commission, 0),
  };
}
