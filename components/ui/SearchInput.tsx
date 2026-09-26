"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function SearchInput({
  value,
  onChange,
  placeholder,
  label,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("relative w-full sm:w-64", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-subtle" />
      <input
        type="search"
        aria-label={label}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-full rounded-md border border-line bg-surface pr-8 pl-8 text-[13px] placeholder:text-subtle hover:border-line-strong focus:border-accent focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded p-1 text-subtle hover:text-ink"
          aria-label="Hapus pencarian"
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}

export function Select<V extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: V;
  onChange: (value: V) => void;
  options: { value: V; label: string }[];
  label: string;
  className?: string;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value as V)}
      className={cn(
        "h-8 rounded-md border border-line bg-surface pr-7 pl-2.5 text-[13px] text-ink-2 hover:border-line-strong focus:border-accent focus:outline-none",
        className
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
