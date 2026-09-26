import {
  Activity,
  Building2,
  Cpu,
  FileText,
  Handshake,
  LayoutDashboard,
  Package,
  Settings,
  UserRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const PRIMARY_NAV: NavItem[] = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard },
  { href: "/devices", label: "Unit & Perangkat", icon: Cpu },
  { href: "/sensors", label: "Sensor", icon: Activity },
  { href: "/contracts", label: "Kontrak & Pelanggan", icon: FileText },
  { href: "/service", label: "Tiket Servis", icon: Wrench },
  { href: "/inventory", label: "Stok Perangkat", icon: Package },
  { href: "/vendors", label: "Rujukan Vendor", icon: Handshake },
  { href: "/economics", label: "Ekonomi Gedung", icon: Building2 },
];

export const SECONDARY_NAV: NavItem[] = [
  { href: "/settings", label: "Pengaturan", icon: Settings },
  { href: "/profile", label: "Profil", icon: UserRound },
];

export const CURRENT_USER = {
  name: "Tim Tangkis",
  role: "Operations Center",
  email: "ops@tangkis.id",
  initials: "TT",
};
