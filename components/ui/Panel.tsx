import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Satu permukaan per section. Sub-bagian di dalamnya dipisah garis, bukan
 * dibungkus kartu baru, supaya layout tidak terasa seperti tumpukan kartu.
 */
export function Panel({
  children,
  className,
  id,
  as: Tag = "section",
  labelledBy,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: "section" | "div";
  labelledBy?: string;
}) {
  return (
    <Tag
      id={id}
      aria-labelledby={labelledBy}
      className={cn("scroll-mt-20 rounded-lg border border-line bg-surface", className)}
    >
      {children}
    </Tag>
  );
}

export function SectionHeader({
  id,
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2 id={id} className="text-[15px] font-semibold tracking-tight text-ink">
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 text-[13px] text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/** Subjudul kecil untuk kelompok informasi di dalam panel. */
export function SubHeading({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h3 className="text-[12px] font-semibold tracking-[0.06em] text-muted uppercase">
        {children}
      </h3>
      {action}
    </div>
  );
}
