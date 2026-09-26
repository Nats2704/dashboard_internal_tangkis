import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function PageContainer({
  children,
  narrow = false,
  className,
}: {
  children: ReactNode;
  /** Lebar baca untuk halaman formulir seperti Pengaturan dan Profil. */
  narrow?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-5 pt-8 pb-20 sm:px-6 lg:px-8",
        narrow ? "max-w-[1100px]" : "max-w-[1520px]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  meta,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-8">
      <div className="min-w-0">
        <h1 className="font-display text-[26px] leading-tight font-bold tracking-[-0.02em] text-ink sm:text-[30px]">
          {title}
        </h1>
        {description ? <p className="mt-2 max-w-2xl text-[14px] text-muted">{description}</p> : null}
      </div>
      {actions || meta ? (
        <div className="flex flex-wrap items-center gap-3 md:justify-end">
          {meta ? <p className="tabular text-[12px] text-muted">{meta}</p> : null}
          {actions}
        </div>
      ) : null}
    </div>
  );
}
