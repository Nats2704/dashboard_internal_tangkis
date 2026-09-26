"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { PRIMARY_NAV, SECONDARY_NAV, type NavItem } from "@/lib/constants/navigation";
import { DATA_SNAPSHOT_AT } from "@/lib/constants";
import { formatTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { useFleet } from "@/components/providers/FleetProvider";
import { useTickets } from "@/components/providers/TicketProvider";
import { Logo } from "./Logo";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/" || pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  item,
  active,
  collapsed,
  count,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  count?: number;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex h-9 items-center gap-3 rounded-md px-2.5 text-[14px] transition-colors",
        active
          ? "bg-white/[0.09] font-medium text-white"
          : "text-white/65 hover:bg-white/[0.05] hover:text-white",
        collapsed && "justify-center px-0"
      )}
    >
      <Icon className={cn("size-[17px] shrink-0", active ? "text-[#7fd6c8]" : "text-white/55 group-hover:text-white/80")} />
      {!collapsed ? <span className="truncate">{item.label}</span> : null}
      {!collapsed && count ? (
        <span className="tabular ml-auto rounded bg-white/[0.08] px-1.5 text-[11px] leading-5 text-white/70">
          {count}
        </span>
      ) : null}
      {collapsed && count ? (
        <span className="absolute top-1.5 right-2 size-1.5 rounded-full bg-[#e0806f]" aria-hidden />
      ) : null}
    </Link>
  );
}

function SidebarContent({
  collapsed,
  onToggleCollapse,
  onNavigate,
  showCollapse,
}: {
  collapsed: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
  showCollapse: boolean;
}) {
  const pathname = usePathname();
  const { devices } = useFleet();
  const { tickets } = useTickets();

  const counts: Record<string, number> = {
    "/devices": devices.filter((d) => d.connectivity === "offline").length,
    "/service": tickets.filter((t) => t.status === "open").length,
  };

  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-16 items-center px-4", collapsed && "justify-center px-0")}>
        <Link href="/dashboard" onClick={onNavigate} aria-label="TANGKIS, ke Beranda">
          <Logo collapsed={collapsed} />
        </Link>
      </div>

      <nav aria-label="Navigasi utama" className="scrollbar-thin flex-1 overflow-y-auto px-3 pt-3">
        {!collapsed ? (
          <p className="mb-2 px-2.5 text-[12px] font-medium text-white/40">Operasional</p>
        ) : null}
        <ul className="space-y-0.5">
          {PRIMARY_NAV.map((item) => (
            <li key={item.href}>
              <NavLink
                item={item}
                active={isActive(pathname, item.href)}
                collapsed={collapsed}
                count={counts[item.href]}
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </ul>

        <div className="my-4 border-t border-white/[0.07]" />

        <ul className="space-y-0.5">
          {SECONDARY_NAV.map((item) => (
            <li key={item.href}>
              <NavLink
                item={item}
                active={isActive(pathname, item.href)}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </ul>
      </nav>

      <div className={cn("border-t border-white/[0.07] px-3 py-3", collapsed && "px-2")}>
        {!collapsed ? (
          <div className="mb-2 flex items-center gap-2 px-2.5 text-[12px] text-white/45">
            <span className="size-1.5 rounded-full bg-[#4fc2b1]" aria-hidden />
            Sinkron data {formatTime(DATA_SNAPSHOT_AT)} WIB
          </div>
        ) : null}
        {showCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              "flex h-9 w-full items-center gap-3 rounded-md px-2.5 text-[13px] text-white/55 hover:bg-white/[0.05] hover:text-white",
              collapsed && "justify-center px-0"
            )}
            aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
            aria-expanded={!collapsed}
          >
            {collapsed ? <PanelLeftOpen className="size-[17px]" /> : <PanelLeftClose className="size-[17px]" />}
            {!collapsed ? "Ciutkan" : null}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden bg-brand-900 transition-[width] duration-200 ease-out lg:block",
          collapsed ? "w-[68px]" : "w-[248px]"
        )}
      >
        <SidebarContent collapsed={collapsed} onToggleCollapse={onToggleCollapse} showCollapse />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="animate-fade-in absolute inset-0 bg-brand-950/40" onClick={onMobileClose} aria-hidden />
          <aside
            className="animate-drawer-in absolute inset-y-0 left-0 w-[272px] max-w-[85vw] bg-brand-900 shadow-2xl"
            aria-label="Menu"
          >
            <button
              type="button"
              onClick={onMobileClose}
              className="absolute top-4 right-3 rounded-md p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
              aria-label="Tutup menu"
            >
              <X className="size-4" />
            </button>
            <SidebarContent collapsed={false} onNavigate={onMobileClose} showCollapse={false} />
          </aside>
        </div>
      ) : null}
    </>
  );
}
