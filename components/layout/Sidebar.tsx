"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import type { AppNotification } from "@/types/notification";
import { NAV_GROUPS, SECONDARY_NAV, isNavActive, type NavItem } from "@/lib/constants/navigation";
import { DATA_SNAPSHOT_AT } from "@/lib/constants";
import { formatDate, formatTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { useFleet } from "@/components/providers/FleetProvider";
import { useTickets } from "@/components/providers/TicketProvider";
import { Logo } from "./Logo";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  notifications: AppNotification[];
}

interface NavCount {
  value: number;
  /** Merah untuk hal yang kritis, netral untuk antrean biasa. */
  critical: boolean;
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
  count?: NavCount;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex h-9 items-center gap-3 rounded-md px-3 text-[13.5px] transition-colors duration-150",
        active ? "bg-fill font-medium text-ink" : "text-muted hover:bg-hover hover:text-ink-2",
        collapsed && "justify-center px-0"
      )}
    >
      {/* Garis aksen kiri dengan cahaya kecil sebagai penanda halaman aktif. */}
      <span
        aria-hidden
        className={cn(
          "absolute top-2 bottom-2 left-0 w-[2px] rounded-full bg-accent shadow-[0_0_10px_1px_var(--color-accent)] transition-opacity duration-200",
          active ? "opacity-100" : "opacity-0"
        )}
      />
      <Icon
        className={cn(
          "size-[17px] shrink-0 transition-colors",
          active ? "text-accent" : "text-subtle group-hover:text-ink-2"
        )}
        strokeWidth={1.75}
      />
      {!collapsed ? <span className="truncate">{item.label}</span> : null}
      {!collapsed && count && count.value > 0 ? (
        <span
          className={cn(
            "tabular ml-auto rounded px-1.5 text-[11px] leading-[18px] font-medium",
            count.critical ? "bg-danger-soft text-danger" : "bg-fill text-muted"
          )}
        >
          {count.value}
        </span>
      ) : null}
      {collapsed && count && count.value > 0 ? (
        <span
          className={cn("absolute top-2 right-3 size-1.5 rounded-full", count.critical ? "bg-danger" : "bg-muted")}
          aria-hidden
        />
      ) : null}
      {collapsed ? (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-full z-50 ml-3 rounded-md border border-line-strong bg-elevated px-2.5 py-1.5 text-[12px] font-medium whitespace-nowrap text-ink opacity-0 shadow-[0_8px_24px_var(--color-shadow)] transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          {item.label}
          {count && count.value > 0 ? <span className="ml-1.5 text-muted">{count.value}</span> : null}
        </span>
      ) : null}
    </Link>
  );
}

function SidebarContent({
  collapsed,
  onToggleCollapse,
  onNavigate,
  showCollapse,
  notifications,
}: {
  collapsed: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
  showCollapse: boolean;
  notifications: AppNotification[];
}) {
  const pathname = usePathname();
  const { devices } = useFleet();
  const { tickets } = useTickets();

  const counts: Record<string, NavCount> = {
    "/alerts": { value: notifications.filter((n) => n.severity === "critical").length, critical: true },
    "/devices": { value: devices.filter((d) => d.connectivity === "offline").length, critical: true },
    "/service": { value: tickets.filter((t) => t.status === "open").length, critical: false },
  };

  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-14 shrink-0 items-center px-4", collapsed && "justify-center px-0")}>
        <Link href="/dashboard" onClick={onNavigate} aria-label="TANGKIS, ke Beranda" className="rounded-md">
          <Logo collapsed={collapsed} />
        </Link>
      </div>

      {/* Saat diciutkan, overflow dibiarkan terlihat supaya tooltip label bisa keluar dari sidebar. */}
      <nav
        aria-label="Navigasi utama"
        className={cn("flex-1 px-2.5 pt-2", collapsed ? "overflow-visible" : "scrollbar-thin overflow-y-auto")}
      >
        {NAV_GROUPS.map((group, index) => (
          <div key={group.label} className={cn(index > 0 && "mt-5")}>
            {collapsed ? (
              index > 0 ? <div className="mx-3 mb-3 border-t border-line" aria-hidden /> : null
            ) : (
              <p className="eyebrow mb-1.5 px-3 text-[10.5px] text-subtle">{group.label}</p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <NavLink
                    item={item}
                    active={isNavActive(pathname, item.href)}
                    collapsed={collapsed}
                    count={counts[item.href]}
                    onNavigate={onNavigate}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="mx-3 my-4 border-t border-line" aria-hidden />

        <ul className="space-y-0.5">
          {SECONDARY_NAV.map((item) => (
            <li key={item.href}>
              <NavLink item={item} active={isNavActive(pathname, item.href)} collapsed={collapsed} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      </nav>

      <div className={cn("shrink-0 border-t border-line px-2.5 py-3")}>
        {!collapsed ? (
          <div className="mb-2 flex items-start gap-2.5 px-3 text-[12px] leading-snug">
            <span className="relative mt-[5px] flex size-1.5 shrink-0" aria-hidden>
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-accent" />
              <span className="relative size-1.5 rounded-full bg-accent" />
            </span>
            <span className="text-muted">
              Snapshot data
              <span className="tabular block text-ink-2">
                {formatDate(DATA_SNAPSHOT_AT)}, {formatTime(DATA_SNAPSHOT_AT)} WIB
              </span>
            </span>
          </div>
        ) : null}
        {showCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              "flex h-9 w-full items-center gap-3 rounded-md px-3 text-[13px] text-subtle transition-colors hover:bg-hover hover:text-ink-2",
              collapsed && "justify-center px-0"
            )}
            aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
            aria-expanded={!collapsed}
          >
            {collapsed ? <PanelLeftOpen className="size-[17px]" strokeWidth={1.75} /> : <PanelLeftClose className="size-[17px]" strokeWidth={1.75} />}
            {!collapsed ? "Ciutkan" : null}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onMobileClose, notifications }: SidebarProps) {
  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden border-r border-line bg-brand-900 transition-[width] duration-200 ease-out lg:block",
          collapsed ? "w-16" : "w-[236px]"
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
          showCollapse
          notifications={notifications}
        />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="animate-fade-in absolute inset-0 bg-overlay backdrop-blur-[2px]" onClick={onMobileClose} aria-hidden />
          <aside
            className="animate-drawer-left absolute inset-y-0 left-0 w-[272px] max-w-[85vw] border-r border-line bg-brand-900 shadow-2xl"
            aria-label="Menu"
          >
            <button
              type="button"
              onClick={onMobileClose}
              className="absolute top-3 right-3 z-10 rounded-md p-2 text-muted hover:bg-hover hover:text-ink"
              aria-label="Tutup menu"
            >
              <X className="size-4" />
            </button>
            <SidebarContent
              collapsed={false}
              onNavigate={onMobileClose}
              showCollapse={false}
              notifications={notifications}
            />
          </aside>
        </div>
      ) : null}
    </>
  );
}
