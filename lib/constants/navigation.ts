import {
  Activity,
  Building2,
  Cpu,
  FileText,
  Gauge,
  Handshake,
  Package,
  Settings,
  Siren,
  UserRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/** Menu dikelompokkan menurut cara kerja operator: pantau, tangani, lalu evaluasi bisnis. */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Pemantauan",
    items: [
      { href: "/dashboard", label: "Beranda", icon: Gauge },
      { href: "/alerts", label: "Alarm", icon: Siren },
      { href: "/devices", label: "Unit & Perangkat", icon: Cpu },
      { href: "/sensors", label: "Sensor BBM", icon: Activity },
    ],
  },
  {
    label: "Operasional",
    items: [
      { href: "/service", label: "Tiket Servis", icon: Wrench },
      { href: "/inventory", label: "Stok Perangkat", icon: Package },
      { href: "/vendors", label: "Rujukan Vendor", icon: Handshake },
    ],
  },
  {
    label: "Bisnis",
    items: [
      { href: "/contracts", label: "Kontrak & Pelanggan", icon: FileText },
      { href: "/economics", label: "Ekonomi Gedung", icon: Building2 },
    ],
  },
];

export const PRIMARY_NAV: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

export const SECONDARY_NAV: NavItem[] = [
  { href: "/settings", label: "Pengaturan", icon: Settings },
  { href: "/profile", label: "Profil", icon: UserRound },
];

export function isNavActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/" || pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Lokasi halaman untuk breadcrumb di header. */
export function locateNav(pathname: string): { group: string; item: NavItem } | null {
  for (const group of NAV_GROUPS) {
    const item = group.items.find((i) => isNavActive(pathname, i.href));
    if (item) return { group: group.label, item };
  }
  const item = SECONDARY_NAV.find((i) => isNavActive(pathname, i.href));
  return item ? { group: "Akun", item } : null;
}

export const CURRENT_USER = {
  name: "Tim Tangkis",
  role: "Operations Center",
  email: "ops@tangkis.id",
  initials: "TT",
};
