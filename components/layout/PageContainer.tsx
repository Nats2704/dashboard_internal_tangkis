import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-[1520px] px-4 pt-6 pb-16 sm:px-6 lg:px-8", className)}>
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
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {meta ? <div className="mb-1.5 text-[12.5px] text-muted">{meta}</div> : null}
        <h1 className="text-[24px] leading-tight font-semibold tracking-tight text-ink sm:text-[26px]">
          {title}
        </h1>
        {description ? <p className="mt-1.5 max-w-2xl text-[14px] text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
