"use client";

import { Menu } from "lucide-react";
import type { AppNotification, SearchEntry } from "@/types/notification";
import { useNow } from "@/lib/hooks/useNow";
import { formatClock, formatLongDate } from "@/lib/utils/format";
import { GlobalSearch } from "./GlobalSearch";
import { NotificationMenu } from "./NotificationMenu";
import { ProfileMenu } from "./ProfileMenu";

interface HeaderProps {
  onOpenMenu: () => void;
  searchEntries: SearchEntry[];
  notifications: AppNotification[];
}

function Clock() {
  const now = useNow();
  return (
    <p className="tabular hidden text-right text-[12.5px] leading-tight text-muted lg:block" aria-live="off">
      {now ? (
        <>
          <span className="block text-ink-2">{formatLongDate(now)}</span>
          <span>{formatClock(now)} WIB</span>
        </>
      ) : (
        <span className="block h-8" />
      )}
    </p>
  );
}

export function Header({ onOpenMenu, searchEntries, notifications }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMenu}
          className="-ml-1.5 rounded-md p-2 text-ink-2 hover:bg-black/[0.05] lg:hidden"
          aria-label="Buka menu"
        >
          <Menu className="size-5" />
        </button>
        <GlobalSearch entries={searchEntries} />
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <Clock />
          <div className="hidden h-8 w-px bg-line lg:block" aria-hidden />
          <NotificationMenu notifications={notifications} />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
