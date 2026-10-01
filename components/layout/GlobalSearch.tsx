"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Building2, Cpu, CornerDownLeft, Search, Wrench } from "lucide-react";
import type { SearchEntry, SearchResultKind } from "@/types/notification";
import { useDismiss } from "@/lib/hooks/useDismiss";
import { cn } from "@/lib/utils/cn";
import { StatusDot } from "@/components/ui/Badge";
import type { Tone } from "@/lib/constants/status";

const KIND_ICON: Record<SearchResultKind, typeof Cpu> = {
  device: Cpu,
  building: Building2,
  ticket: Wrench,
};

const KIND_LABEL: Record<SearchResultKind, string> = {
  device: "Unit",
  building: "Gedung",
  ticket: "Tiket",
};

const STATUS_TONE: Record<string, Tone> = {
  Online: "success",
  Offline: "danger",
  Maintenance: "warning",
  "Dalam Perbaikan": "warning",
  "Ditarik Kembali": "info",
  "Di Gudang": "neutral",
  Open: "danger",
  "In Progress": "warning",
  Completed: "success",
};

function rank(entry: SearchEntry, query: string): number {
  const title = entry.title.toLowerCase();
  if (title === query) return 0;
  if (title.startsWith(query)) return 1;
  if (title.includes(query)) return 2;
  return 3;
}

export function GlobalSearch({ entries }: { entries: SearchEntry[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const refs = useMemo(() => [rootRef], []);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, refs);

  const normalized = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!normalized) return [];
    return entries
      .filter((e) => e.keywords.includes(normalized))
      .sort((a, b) => rank(a, normalized) - rank(b, normalized) || a.title.localeCompare(b.title, "id", { numeric: true }))
      .slice(0, 8);
  }, [entries, normalized]);

  // Pintasan "/" atau Ctrl/⌘+K untuk fokus ke pencarian.
  useEffect(() => {
    function handle(event: globalThis.KeyboardEvent) {
      const target = event.target as HTMLElement;
      const typing = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || (event.key === "/" && !typing)) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, []);

  function go(entry: SearchEntry) {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    router.push(entry.href);
  }

  function handleKey(event: KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(results[activeIndex]);
    }
  }

  const showPanel = open && normalized.length > 0;

  return (
    <div ref={rootRef} className="relative w-full max-w-[420px]">
      <label htmlFor={`${listId}-input`} className="sr-only">
        Cari unit, gedung, atau tiket
      </label>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
      <input
        ref={inputRef}
        id={`${listId}-input`}
        type="search"
        autoComplete="off"
        value={query}
        placeholder="Cari unit, gedung, atau tiket…"
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIndex(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKey}
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showPanel && results[activeIndex] ? `${listId}-${activeIndex}` : undefined}
        className="h-9 w-full rounded-md border border-line bg-sunken/80 pr-12 pl-9 text-[13.5px] text-ink transition-colors placeholder:text-subtle hover:border-line-strong focus:border-accent-line focus:bg-surface focus:ring-2 focus:ring-accent-soft focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded border border-line-strong bg-surface px-1.5 font-mono text-[11px] text-subtle sm:block">
        /
      </kbd>

      {showPanel ? (
        <div className="animate-pop-in absolute top-full right-0 left-0 z-40 mt-2 overflow-hidden rounded-lg border border-line-strong bg-elevated shadow-[0_20px_48px_rgb(0_0_0/0.5)]">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-[13px] text-muted">
              Tidak ada unit, gedung, atau tiket yang cocok dengan “{query.trim()}”.
            </p>
          ) : (
            <ul id={listId} role="listbox" aria-label="Hasil pencarian" className="max-h-[380px] overflow-y-auto py-1.5">
              {results.map((entry, index) => {
                const Icon = KIND_ICON[entry.kind];
                const active = index === activeIndex;
                return (
                  <li
                    key={`${entry.kind}-${entry.id}`}
                    id={`${listId}-${index}`}
                    role="option"
                    aria-selected={active}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      go(entry);
                    }}
                    className={cn(
                      "mx-1.5 flex cursor-pointer items-start gap-3 rounded-md px-2.5 py-2",
                      active && "bg-hover"
                    )}
                  >
                    <Icon className="mt-0.5 size-4 shrink-0 text-subtle" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn("font-medium text-ink", entry.kind === "building" ? "text-[14px]" : "font-mono text-[13px]")}>
                          {entry.title}
                        </span>
                        <span className="text-[11px] text-subtle">{KIND_LABEL[entry.kind]}</span>
                      </div>
                      <p className="truncate text-[13px] text-muted">{entry.subtitle}</p>
                      {entry.status || entry.meta ? (
                        <p className="mt-0.5 flex items-center gap-2 text-[12px] text-muted">
                          {entry.status ? (
                            <span className="inline-flex items-center gap-1.5 font-medium text-ink-2">
                              <StatusDot tone={STATUS_TONE[entry.status] ?? "neutral"} />
                              {entry.status}
                            </span>
                          ) : null}
                          {entry.status && entry.meta ? <span className="text-line-strong">·</span> : null}
                          {entry.meta}
                        </p>
                      ) : null}
                    </div>
                    {active ? <CornerDownLeft className="mt-1 size-3.5 shrink-0 text-subtle" /> : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
