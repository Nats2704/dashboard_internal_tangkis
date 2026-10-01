import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface DetailItem {
  label: string;
  value: ReactNode;
  mono?: boolean;
}

export function DetailList({
  items,
  columns = 2,
  className,
}: {
  items: DetailItem[];
  columns?: 1 | 2;
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "grid gap-x-6 gap-y-4",
        columns === 2 ? "grid-cols-2" : "grid-cols-1",
        className
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-[11.5px] text-muted">{item.label}</dt>
          <dd
            className={cn(
              "mt-0.5 text-[13.5px] text-ink",
              item.mono && "tabular font-mono text-[12.5px]"
            )}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function DrawerSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border-t border-line px-6 py-5 first:border-t-0", className)}>
      <h3 className="eyebrow mb-3">
        {title}
      </h3>
      {children}
    </section>
  );
}
