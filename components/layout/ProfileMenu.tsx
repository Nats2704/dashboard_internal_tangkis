"use client";

import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { CURRENT_USER } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils/cn";

export function Avatar({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-800 text-[12px] font-semibold text-white",
        className
      )}
      aria-hidden
    >
      {CURRENT_USER.initials}
    </span>
  );
}

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
          className={cn(
            "flex items-center gap-2 rounded-md py-1 pr-1.5 pl-1 hover:bg-black/[0.05]",
            open && "bg-black/[0.05]"
          )}
        >
          <Avatar />
          <span className="hidden text-left leading-tight xl:block">
            <span className="block text-[13px] font-medium text-ink">{CURRENT_USER.name}</span>
            <span className="block text-[11.5px] text-muted">{CURRENT_USER.role}</span>
          </span>
          <ChevronDown className="hidden size-3.5 text-subtle xl:block" />
        </button>
      )}
    >
      {(close) => (
        <>
          <div className="border-b border-line px-2.5 pt-1.5 pb-2.5">
            <p className="text-[13px] font-medium">{CURRENT_USER.name}</p>
            <p className="text-[12px] text-muted">{CURRENT_USER.email}</p>
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
