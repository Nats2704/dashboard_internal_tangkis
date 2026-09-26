"use client";

import Link from "next/link";
import type { VendorRequest } from "@/types/vendor";
import { Drawer } from "@/components/ui/Drawer";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { DetailList, DrawerSection } from "@/components/ui/DetailList";
import { useReferenceData } from "@/components/providers/ReferenceDataProvider";
import { VENDOR_SERVICE, VENDOR_STATUS } from "@/lib/constants/status";
import { formatDate, formatNumber, formatRupiah } from "@/lib/utils/format";

const STEPS = ["waiting", "in_progress", "done"] as const;
const STEP_LABEL = { waiting: "Rujukan dikirim", in_progress: "Vendor mengerjakan", done: "Pekerjaan selesai" };

export function VendorRequestDrawer({ request, onClose }: { request: VendorRequest | null; onClose: () => void }) {
  const { vendorById, buildingById } = useReferenceData();
  if (!request) return null;
  const vendor = vendorById.get(request.vendorId);
  const status = VENDOR_STATUS[request.status];
  const currentStep = STEPS.indexOf(request.status);

  return (
    <Drawer
      open
      onClose={onClose}
      title={`${VENDOR_SERVICE[request.service]} — ${request.deviceId}`}
      subtitle={`${request.id} · ${buildingById.get(request.buildingId)?.name ?? ""}`}
      headerExtra={
        <Badge tone={status.tone} variant="soft">
          {status.label}
        </Badge>
      }
      footer={
        <Link href={`/devices?unit=${request.deviceId}`} className={buttonClasses("secondary", "md")}>
          Lihat unit {request.deviceId}
        </Link>
      }
    >
      <DrawerSection title="Alasan rujukan">
        <p className="text-[14px] leading-relaxed text-ink">{request.note}</p>
      </DrawerSection>
      <DrawerSection title="Progres">
        <ol className="flex items-start">
          {STEPS.map((step, i) => {
            const reached = i <= currentStep;
            return (
              <li key={step} className="flex flex-1 flex-col items-start">
                <div className="flex w-full items-center">
                  <span className={`size-2.5 shrink-0 rounded-full ${reached ? "bg-accent" : "bg-line-strong"}`} aria-hidden />
                  {i < STEPS.length - 1 ? (
                    <span className={`h-px flex-1 ${i < currentStep ? "bg-accent" : "bg-line"}`} aria-hidden />
                  ) : null}
                </div>
                <span className={`mt-2 pr-2 text-[12px] ${reached ? "text-ink" : "text-subtle"}`}>{STEP_LABEL[step]}</span>
              </li>
            );
          })}
        </ol>
      </DrawerSection>
      <DrawerSection title="Vendor">
        <DetailList
          items={[
            { label: "Nama", value: vendor?.name ?? "—" },
            { label: "Kota", value: vendor?.city ?? "—" },
            { label: "Kontak", value: vendor?.contact ?? "—" },
            { label: "Layanan", value: VENDOR_SERVICE[request.service] },
          ]}
        />
      </DrawerSection>
      <DrawerSection title="Nilai & komisi">
        <DetailList
          items={[
            { label: "Nilai pekerjaan", value: formatRupiah(request.jobValue) },
            {
              label: "Komisi TANGKIS",
              value: (
                <span>
                  <span className="font-semibold">{formatRupiah(request.commission)}</span>{" "}
                  <span className="text-muted">({formatNumber((request.commission / request.jobValue) * 100, 0)}%)</span>
                </span>
              ),
            },
            { label: "Tanggal rujukan", value: formatDate(request.requestedAt) },
            { label: "Selesai", value: formatDate(request.completedAt) },
          ]}
        />
      </DrawerSection>
    </Drawer>
  );
}
