import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Satu section di halaman, bukan kartu: dibuka garis tegas lalu judul.
 * Section melebar 20px ke kiri-kanan supaya teks di dalamnya (px-5) sejajar
 * dengan judul halaman, sementara garis dan latar hover baris tabel mengisi penuh.
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
      className={cn("-mx-5 scroll-mt-20 border-t border-ink", className)}
    >
      {children}
    </Tag>
  );
}

export function SectionHeader({
  id,
  title,
  description,
  actions,
  href,
  linkLabel = "Lihat semua",
  flush = false,
  className,
}: {
  id?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  /** Tautan ke halaman lengkap section ini. */
  href?: string;
  linkLabel?: string;
  /** Tanpa jarak bawah, untuk section yang langsung disambung toolbar sendiri. */
  flush?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 px-5 pt-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6",
        flush ? "pb-0" : "pb-4",
        className
      )}
    >
      <div className="min-w-0">
        <h2 id={id} className="font-heading text-[19px] leading-7 font-bold tracking-[-0.01em] text-ink">
          {title}
        </h2>
        {description ? <p className="mt-0.5 text-[13px] text-muted">{description}</p> : null}
      </div>
      {actions || href ? (
        <div className="flex shrink-0 flex-wrap items-center gap-4">
          {actions}
          {href ? <SectionLink href={href}>{linkLabel}</SectionLink> : null}
        </div>
      ) : null}
    </div>
  );
}

export function SectionLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1 text-[13px] font-medium whitespace-nowrap text-accent underline-offset-4 hover:text-accent-strong hover:underline"
    >
      {children}
      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

/** Subjudul kelompok informasi di dalam section. */
export function SubHeading({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h3 className="text-[13px] font-semibold text-ink">{children}</h3>
      {action}
    </div>
  );
}
