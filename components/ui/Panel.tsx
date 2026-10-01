import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Panel dasar: permukaan satu tingkat di atas latar, garis 1px, radius 8px.
 * Isi memakai px-5 supaya teks, tabel, dan header sejajar.
 * Jangan beri animasi transform di sini: panel sering memuat drawer/modal fixed.
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
      className={cn(
        "scroll-mt-20 overflow-hidden rounded-xl border border-line bg-surface shadow-[inset_0_1px_0_rgb(255_255_255/0.025)]",
        className
      )}
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
  eyebrow,
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
  /** Label kecil di atas judul. */
  eyebrow?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 px-5 pt-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6",
        flush ? "pb-0" : "pb-4",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow ? <p className="eyebrow mb-1">{eyebrow}</p> : null}
        <h2 id={id} className="font-heading text-[15px] leading-6 font-semibold tracking-[-0.01em] text-ink">
          {title}
        </h2>
        {description ? <p className="mt-0.5 text-[12.5px] leading-snug text-muted">{description}</p> : null}
      </div>
      {actions || href ? (
        <div className="flex shrink-0 flex-wrap items-center gap-4 sm:pt-0.5">
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
      className="group inline-flex items-center gap-1 rounded text-[12.5px] font-medium whitespace-nowrap text-accent underline-offset-4 hover:text-accent-strong"
    >
      {children}
      <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
    </Link>
  );
}

/** Subjudul kelompok informasi di dalam section. */
export function SubHeading({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h3 className="eyebrow">{children}</h3>
      {action}
    </div>
  );
}

/** Judul kelompok antar-section di halaman panjang. */
export function SectionDivider({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex items-center gap-4 pt-4">
      <div className="shrink-0">
        <p className="eyebrow text-subtle">{title}</p>
        {description ? <p className="mt-0.5 text-[12.5px] text-muted">{description}</p> : null}
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-line-strong to-transparent" aria-hidden />
    </div>
  );
}
