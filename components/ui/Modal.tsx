"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";
import { useDismiss } from "@/lib/hooks/useDismiss";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  /** Cegah menutup modal saat proses berjalan. */
  locked?: boolean;
}

export function Modal({ open, onClose, title, description, footer, children, locked }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const close = locked ? () => {} : onClose;
  useBodyScrollLock(open);
  useDismiss(open && !locked, onClose);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="animate-fade-in absolute inset-0 bg-brand-950/35" onClick={close} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="animate-pop-in relative flex max-h-[90vh] w-full flex-col rounded-t-xl bg-surface shadow-[0_20px_60px_rgb(10_29_25/0.22)] outline-none sm:max-w-[480px] sm:rounded-xl"
      >
        <header className="flex items-start justify-between gap-4 px-6 pt-5 pb-4">
          <div>
            <h2 id={titleId} className="text-[16px] font-semibold tracking-tight">
              {title}
            </h2>
            {description ? <p className="mt-1 text-[13px] text-muted">{description}</p> : null}
          </div>
          {!locked ? (
            <button
              type="button"
              onClick={onClose}
              className="-mr-2 rounded-md p-1.5 text-muted hover:bg-black/[0.05] hover:text-ink"
              aria-label="Tutup"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </header>
        <div className="scrollbar-thin overflow-y-auto px-6 pb-5">{children}</div>
        {footer ? (
          <footer className="flex items-center justify-end gap-2 rounded-b-xl border-t border-line bg-sunken px-6 py-3.5">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
}
