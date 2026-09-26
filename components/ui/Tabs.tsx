"use client";

import { useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils/cn";

export interface TabItem<V extends string> {
  value: V;
  label: string;
  count?: number;
}

interface TabsProps<V extends string> {
  items: TabItem<V>[];
  value: V;
  onChange: (value: V) => void;
  label: string;
  variant?: "segmented" | "underline";
  className?: string;
}

/** Filter status berbentuk tab. Navigasi panah kiri/kanan sesuai pola ARIA tabs. */
export function Tabs<V extends string>({
  items,
  value,
  onChange,
  label,
  variant = "segmented",
  className,
}: TabsProps<V>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % items.length
        : (index - 1 + items.length) % items.length;
    onChange(items[next].value);
    refs.current[next]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        "scrollbar-thin flex max-w-full items-center overflow-x-auto",
        variant === "segmented"
          ? "gap-0.5 rounded-md bg-sunken p-0.5"
          : "gap-5 border-b border-line",
        className
      )}
    >
      {items.map((item, index) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.value)}
            onKeyDown={(e) => handleKey(e, index)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 text-[13px] font-medium whitespace-nowrap transition-colors",
              variant === "segmented"
                ? cn(
                    "h-7 rounded-sm px-2.5",
                    selected
                      ? "bg-surface text-ink ring-1 ring-line-strong/70"
                      : "text-muted hover:text-ink"
                  )
                : cn(
                    "-mb-px border-b-2 pb-2.5",
                    selected ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"
                  )
            )}
          >
            {item.label}
            {item.count !== undefined ? (
              <span
                className={cn(
                  "tabular text-[12px]",
                  selected ? "text-muted" : "text-subtle"
                )}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
