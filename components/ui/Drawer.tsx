"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";
import { useDismiss } from "@/lib/hooks/useDismiss";
import { cn } from "@/lib/utils/cn";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  headerExtra?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  width?: "md" | "lg";
}

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  headerExtra,
  footer,
  children,
  width = "md",
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useBodyScrollLock(open);
  useDismiss(open, onClose);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="animate-fade-in absolute inset-0 bg-overlay backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "animate-drawer-in absolute inset-y-0 right-0 flex w-full flex-col border-l border-line-strong bg-elevated shadow-[-24px_0_60px_var(--color-shadow)] outline-none",
          width === "lg" ? "max-w-[560px]" : "max-w-[460px]"
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div className="min-w-0">
            <h2 id={titleId} className="font-mono text-[16px] font-semibold tracking-tight text-ink">
              {title}
            </h2>
            {subtitle ? <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p> : null}
            {headerExtra ? <div className="mt-3">{headerExtra}</div> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 rounded-md p-1.5 text-muted transition-colors hover:bg-hover hover:text-ink"
            aria-label="Tutup panel"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="scrollbar-thin flex-1 overflow-y-auto">{children}</div>
        {footer ? (
          <footer className="flex items-center justify-end gap-2 border-t border-line bg-surface px-6 py-3.5">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
}
