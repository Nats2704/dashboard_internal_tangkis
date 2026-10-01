"use client";

import { usePathname } from "next/navigation";
import { ChevronRight, Menu } from "lucide-react";
import type { AppNotification, SearchEntry } from "@/types/notification";
import { useClock } from "@/lib/hooks/useClock";
import { locateNav } from "@/lib/constants/navigation";
import { DATA_SNAPSHOT_AT } from "@/lib/constants";
import { formatClockSeconds, formatLongDate, formatShortDateTime } from "@/lib/utils/format";
import { GlobalSearch } from "./GlobalSearch";
import { NotificationMenu } from "./NotificationMenu";
import { ProfileMenu } from "./ProfileMenu";
import { SystemStatus } from "./SystemStatus";

interface HeaderProps {
  onOpenMenu: () => void;
  searchEntries: SearchEntry[];
  notifications: AppNotification[];
}

function Clock() {
  const now = useClock();
  return (
    <div className="hidden text-right leading-tight xl:block" aria-live="off">
      {now ? (
        <>
          <p className="tabular font-mono text-[13px] font-medium text-ink">
            {formatClockSeconds(now)} <span className="font-sans text-[11px] font-normal text-muted">WIB</span>
          </p>
          <p className="text-[11px] text-subtle" title={formatLongDate(now)}>
            Data per {formatShortDateTime(DATA_SNAPSHOT_AT)}
          </p>
        </>
      ) : (
        <span className="block h-8 w-28" />
      )}
    </div>
  );
}

function Breadcrumb() {
  const pathname = usePathname();
  const location = locateNav(pathname);
  if (!location) return null;
  return (
    <nav aria-label="Lokasi halaman" className="hidden min-w-0 items-center gap-1.5 text-[13px] md:flex">
      <span className="text-subtle">{location.group}</span>
      <ChevronRight className="size-3.5 shrink-0 text-subtle/70" aria-hidden />
      <span className="truncate font-medium text-ink" aria-current="page">
        {location.item.label}
      </span>
    </nav>
  );
}

export function Header({ onOpenMenu, searchEntries, notifications }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas/80 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/70">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={onOpenMenu}
          className="-ml-1.5 rounded-md p-2 text-ink-2 hover:bg-hover hover:text-ink lg:hidden"
          aria-label="Buka menu"
        >
          <Menu className="size-5" />
        </button>
        <div className="w-auto shrink-0 md:w-[200px] xl:w-[240px]">
          <Breadcrumb />
        </div>
        <div className="flex min-w-0 flex-1 justify-center">
          <GlobalSearch entries={searchEntries} />
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <SystemStatus notifications={notifications} />
          </div>
          <Clock />
          <div className="hidden h-7 w-px bg-line sm:block" aria-hidden />
          <NotificationMenu notifications={notifications} />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
