"use client";

import type { BuildingEconomicsRow } from "@/types/economics";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { useReferenceData } from "@/components/providers/ReferenceDataProvider";
import { VARIANCE_LEVEL } from "@/lib/constants/status";
import { formatRupiahShort, formatSignedPercent } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export function EconomicsTable({
  rows,
  detailed = false,
  pageSize,
}: {
  rows: BuildingEconomicsRow[];
  detailed?: boolean;
  pageSize?: number;
}) {
  const { buildingById } = useReferenceData();

  const breakdownColumns: Column<BuildingEconomicsRow>[] = detailed
    ? (
        [
          ["connectivity", "Konektivitas"],
          ["service", "Kunjungan"],
          ["parts", "Suku cadang"],
          ["calibration", "Kalibrasi"],
        ] as const
      ).map(([key, header]) => ({
        key,
        header,
        align: "right" as const,
        hideBelow: "lg" as const,
        sortValue: (r: BuildingEconomicsRow) => r.breakdown[key],
        cell: (r: BuildingEconomicsRow) => <span className="text-muted">{formatRupiahShort(r.breakdown[key])}</span>,
      }))
    : [];

  const columns: Column<BuildingEconomicsRow>[] = [
    {
      key: "building",
      header: "Gedung",
      sortValue: (r) => buildingById.get(r.buildingId)?.name ?? "",
      cell: (r) => (
        <span className="inline-flex items-center gap-2">
          <span className="font-medium text-ink">{buildingById.get(r.buildingId)?.name}</span>
          {r.dataMonths < 12 ? (
            <span className="rounded bg-white/[0.06] px-1.5 text-[11px] text-muted" title="Angka disetahunkan dari data kurang dari 12 bulan">
              {r.dataMonths} bln
            </span>
          ) : null}
        </span>
      ),
    },
    {
      key: "units",
      header: "Unit",
      align: "right",
      hideBelow: "md",
      sortValue: (r) => r.unitCount,
      cell: (r) => r.unitCount,
    },
    ...breakdownColumns,
    {
      key: "actual",
      header: "Aktual",
      align: "right",
      sortValue: (r) => r.actualPerUnit,
      cell: (r) => <span className="font-medium text-ink">{formatRupiahShort(r.actualPerUnit)}</span>,
    },
    {
      key: "assumption",
      header: "Asumsi",
      align: "right",
      hideBelow: detailed ? "md" : "xl",
      cell: (r) => <span className="text-muted">{formatRupiahShort(r.assumptionPerUnit)}</span>,
    },
    {
      key: "variance",
      header: "Variance",
      align: "right",
      sortValue: (r) => r.variancePct,
      cell: (r) => (
        <span
          className={cn(
            "font-medium",
            r.level === "warning" ? "text-danger" : r.level === "deviation" ? "text-warning" : "text-ink-2"
          )}
        >
          {formatSignedPercent(r.variancePct)}
        </span>
      ),
    },
    ...(detailed
      ? [
          {
            key: "gap",
            header: "Selisih/tahun",
            align: "right" as const,
            hideBelow: "sm" as const,
            sortValue: (r: BuildingEconomicsRow) => r.annualGap,
            cell: (r: BuildingEconomicsRow) => formatRupiahShort(r.annualGap),
          },
          {
            key: "level",
            header: "Status",
            cell: (r: BuildingEconomicsRow) => (
              <Badge tone={VARIANCE_LEVEL[r.level].tone}>{VARIANCE_LEVEL[r.level].label}</Badge>
            ),
          },
        ]
      : []),
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      getRowId={(r) => r.buildingId}
      caption="Biaya aktual per unit per tahun dibanding asumsi"
      pageSize={pageSize}
      initialSort={{ key: "variance", direction: "desc" }}
      compact={!detailed}
    />
  );
}
