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
        "mx-auto w-full px-4 pt-6 pb-20 sm:px-6 lg:px-8 lg:pt-8",
        narrow ? "max-w-[1040px]" : "max-w-[1600px]",
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
  eyebrow,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
  /** Label kecil di atas judul, misalnya ringkasan status. */
  eyebrow?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-8 lg:mb-8">
      <div className="min-w-0">
        {eyebrow ? <div className="mb-2">{eyebrow}</div> : null}
        <h1 className="font-display text-[24px] leading-tight font-semibold tracking-[-0.025em] text-ink sm:text-[28px]">
          {title}
        </h1>
        {description ? <p className="mt-1.5 max-w-2xl text-[13.5px] text-muted">{description}</p> : null}
      </div>
      {actions || meta ? (
        <div className="flex flex-wrap items-center gap-3 md:justify-end">
          {meta ? <div className="tabular text-[12px] text-muted">{meta}</div> : null}
          {actions}
        </div>
      ) : null}
    </div>
  );
}
