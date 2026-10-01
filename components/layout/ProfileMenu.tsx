"use client";

import { LogOut, Settings, UserRound } from "lucide-react";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { CURRENT_USER } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils/cn";

export function Avatar({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full border border-line-strong bg-brand-800 text-[11.5px] font-semibold tracking-wide text-ink",
        className
      )}
      aria-hidden
    >
      {CURRENT_USER.initials}
    </span>
  );
}

/** Profil tampil minimal di header: avatar saja, detail di dalam menu. */
export function ProfileMenu() {
  return (
    <Dropdown
      panelClassName="w-60 p-1.5"
      trigger={({ open, toggle, id }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls={id}
          aria-label="Menu profil"
          className={cn("rounded-full p-0.5 transition-shadow hover:ring-2 hover:ring-line-strong", open && "ring-2 ring-accent-line")}
        >
          <Avatar />
        </button>
      )}
    >
      {(close) => (
        <>
          <div className="flex items-center gap-2.5 border-b border-line px-2.5 pt-1.5 pb-2.5">
            <Avatar />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-ink">{CURRENT_USER.name}</p>
              <p className="truncate text-[12px] text-muted">
                {CURRENT_USER.role} · {CURRENT_USER.email}
              </p>
            </div>
          </div>
          <div className="pt-1.5">
            <DropdownItem href="/profile" onSelect={close} icon={<UserRound className="size-4 text-subtle" />}>
              Profil
            </DropdownItem>
            <DropdownItem href="/settings" onSelect={close} icon={<Settings className="size-4 text-subtle" />}>
              Pengaturan
            </DropdownItem>
            <DropdownItem disabled icon={<LogOut className="size-4" />}>
              Keluar
              <span className="ml-auto text-[11px]">belum aktif</span>
            </DropdownItem>
          </div>
        </>
      )}
    </Dropdown>
  );
}
