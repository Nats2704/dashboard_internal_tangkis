"use client";

import { useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Jika diisi, kolom bisa diurutkan. */
  sortValue?: (row: T) => string | number | null;
  align?: "left" | "right";
  className?: string;
  /** Sembunyikan kolom di layar sempit tanpa menghapus datanya. */
  hideBelow?: "sm" | "md" | "lg" | "xl";
}

export type SortDirection = "asc" | "desc";

export interface SortState {
  key: string;
  direction: SortDirection;
}

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string;
  caption: string;
  onRowClick?: (row: T) => void;
  selectedId?: string | null;
  initialSort?: SortState;
  pageSize?: number;
  emptyMessage?: ReactNode;
  className?: string;
  /** Baris yang ditandai (mis. sudah diperbarui) mendapat latar lembut. */
  highlightIds?: Set<string>;
  /** Tabel ringkas untuk kolom sempit, tanpa lebar minimum. */
  compact?: boolean;
  /**
   * Tinggi maksimum area tabel. Bila diisi, tabel bergulir di dalam panel dan
   * header kolom tetap menempel di atas. Default aktif untuk halaman berisi
   * 15 baris atau lebih.
   */
  maxHeight?: string | null;
}

const HIDE: Record<NonNullable<Column<unknown>["hideBelow"]>, string> = {
  // Container query: kolom menyesuaikan lebar panel, bukan lebar layar.
  sm: "hidden @lg:table-cell",
  md: "hidden @2xl:table-cell",
  lg: "hidden @3xl:table-cell",
  xl: "hidden @4xl:table-cell",
};

function compare(a: string | number | null, b: string | number | null): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "id", { numeric: true });
}

export function DataTable<T>({
  rows,
  columns,
  getRowId,
  caption,
  onRowClick,
  selectedId,
  initialSort,
  pageSize,
  emptyMessage = "Tidak ada data untuk filter ini.",
  className,
  highlightIds,
  compact = false,
  maxHeight,
}: DataTableProps<T>) {
  const scrollHeight = maxHeight === undefined ? (pageSize && pageSize >= 15 ? "min(68vh, 660px)" : null) : maxHeight;
  const [sort, setSort] = useState<SortState | null>(initialSort ?? null);
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((c) => c.key === sort.key);
    if (!column?.sortValue) return rows;
    const factor = sort.direction === "asc" ? 1 : -1;
    const getter = column.sortValue;
    return [...rows].sort((a, b) => {
      const va = getter(a);
      const vb = getter(b);
      // Nilai kosong selalu di bawah, apa pun arah urutan.
      if (va === null || vb === null) return compare(va, vb);
      return compare(va, vb) * factor;
    });
  }, [rows, columns, sort]);

  const pageCount = pageSize ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  const safePage = Math.min(page, pageCount - 1);
  const visible = pageSize
    ? sorted.slice(safePage * pageSize, safePage * pageSize + pageSize)
    : sorted;

  function toggleSort(key: string) {
    setPage(0);
    setSort((current) => {
      if (!current || current.key !== key) return { key, direction: "asc" };
      if (current.direction === "asc") return { key, direction: "desc" };
      return null;
    });
  }

  function handleRowKey(event: KeyboardEvent<HTMLTableRowElement>, row: T) {
    if (!onRowClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onRowClick(row);
    }
  }

  return (
    <div className={cn("@container min-w-0", className)}>
      <div className="scrollbar-thin overflow-x-auto" style={scrollHeight ? { maxHeight: scrollHeight } : undefined}>
        <table className={cn("w-full border-collapse text-left text-[13px]", !compact && "min-w-[520px]")}>
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              {columns.map((column) => {
                const active = sort?.key === column.key;
                const ariaSort = active
                  ? sort?.direction === "asc"
                    ? "ascending"
                    : "descending"
                  : undefined;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={ariaSort}
                    className={cn(
                      "sticky top-0 z-[1] h-10 border-b border-line bg-surface/95 px-5 text-[11px] font-medium tracking-[0.06em] whitespace-nowrap text-muted uppercase backdrop-blur first:pl-5",
                      column.align === "right" && "text-right",
                      column.hideBelow && HIDE[column.hideBelow],
                      column.className
                    )}
                  >
                    {column.sortValue ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        className={cn(
                          "group -mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 uppercase transition-colors hover:text-ink",
                          active && "text-accent",
                          column.align === "right" && "flex-row-reverse"
                        )}
                      >
                        {column.header}
                        {active ? (
                          sort?.direction === "asc" ? (
                            <ArrowUp className="size-3" />
                          ) : (
                            <ArrowDown className="size-3" />
                          )
                        ) : (
                          <ChevronsUpDown className="size-3 opacity-0 transition-opacity group-hover:opacity-60" />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-10 text-center text-[13px] text-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              visible.map((row) => {
                const id = getRowId(row);
                const selected = selectedId === id;
                return (
                  <tr
                    key={id}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    onKeyDown={(e) => handleRowKey(e, row)}
                    tabIndex={onRowClick ? 0 : undefined}
                    data-selected={selected || undefined}
                    className={cn(
                      "border-b border-line/60 transition-colors duration-150 last:border-b-0",
                      onRowClick &&
                        "cursor-pointer hover:bg-hover focus-visible:bg-hover focus-visible:outline-none [&:hover>td:first-child]:shadow-[inset_2px_0_0_var(--color-line-strong)]",
                      selected && "bg-accent-soft hover:bg-accent-soft [&>td:first-child]:shadow-[inset_2px_0_0_var(--color-accent)]!",
                      highlightIds?.has(id) && "bg-success-soft"
                    )}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          "h-11 px-5 whitespace-nowrap text-ink-2",
                          column.align === "right" && "tabular text-right",
                          column.hideBelow && HIDE[column.hideBelow],
                          column.className
                        )}
                      >
                        {column.cell(row)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {pageSize && sorted.length > pageSize ? (
        <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-2 text-[12.5px] text-muted">
          <span className="tabular">
            {safePage * pageSize + 1}–{Math.min(sorted.length, (safePage + 1) * pageSize)} dari{" "}
            {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage(Math.max(0, safePage - 1))}
              disabled={safePage === 0}
              className="rounded-md p-1.5 transition-colors hover:bg-hover hover:text-ink disabled:opacity-35 disabled:hover:bg-transparent"
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="tabular px-1">
              {safePage + 1} / {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setPage(Math.min(pageCount - 1, safePage + 1))}
              disabled={safePage >= pageCount - 1}
              className="rounded-md p-1.5 transition-colors hover:bg-hover hover:text-ink disabled:opacity-35 disabled:hover:bg-transparent"
              aria-label="Halaman berikutnya"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
