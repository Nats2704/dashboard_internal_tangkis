"use client";

import { useCallback, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { useDismiss } from "@/lib/hooks/useDismiss";
import { cn } from "@/lib/utils/cn";

interface DropdownProps {
  trigger: (props: {
    open: boolean;
    toggle: () => void;
    id: string;
  }) => ReactNode;
  children: (close: () => void) => ReactNode;
  align?: "left" | "right";
  className?: string;
  panelClassName?: string;
}

export function Dropdown({ trigger, children, align = "right", className, panelClassName }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const close = useCallback(() => setOpen(false), []);
  const refs = useMemo(() => [rootRef], []);
  useDismiss(open, close, refs);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {trigger({ open, toggle: () => setOpen((v) => !v), id })}
      {open ? (
        <div
          id={id}
          className={cn(
            "animate-pop-in absolute top-full z-40 mt-2 rounded-lg border border-line-strong bg-elevated shadow-[0_20px_48px_rgb(0_0_0/0.5)]",
            align === "right" ? "right-0" : "left-0",
            panelClassName
          )}
        >
          {children(close)}
        </div>
      ) : null}
    </div>
  );
}

export function DropdownItem({
  children,
  onSelect,
  href,
  disabled,
  icon,
}: {
  children: ReactNode;
  onSelect?: () => void;
  href?: string;
  disabled?: boolean;
  icon?: ReactNode;
}) {
  const classes = cn(
    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] text-ink-2",
    disabled ? "cursor-not-allowed text-subtle" : "transition-colors hover:bg-hover hover:text-ink"
  );
  if (href && !disabled) {
    return (
      <a href={href} className={classes} onClick={onSelect}>
        {icon}
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={classes} onClick={onSelect} disabled={disabled}>
      {icon}
      {children}
    </button>
  );
}
