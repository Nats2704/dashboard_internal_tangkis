import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AppShell } from "@/components/layout/AppShell";
import { getBuildings, getCustomers } from "@/lib/services/buildingService";
import { getDevices } from "@/lib/services/deviceService";
import { getTechnicians, getTickets } from "@/lib/services/ticketService";
import { getVendors } from "@/lib/services/vendorService";
import { getNotifications, getSearchIndex } from "@/lib/services/notificationService";
import "./globals.css";

// Geist Sans untuk seluruh teks, Geist Mono untuk kode unit, ID, dan firmware.
// Keduanya dibundel paket `geist`, jadi build tidak mengunduh font.

export const metadata: Metadata = {
  title: {
    default: "TANGKIS · Monitoring Operasional",
    template: "%s · TANGKIS",
  },
  description:
    "Pemantauan kesehatan unit, sensor, kontrak, servis, stok, vendor, dan ekonomi per gedung.",
};

export const viewport: Viewport = {
  themeColor: "#090e15",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [buildings, customers, technicians, vendors, devices, tickets, notifications, searchEntries] =
    await Promise.all([
      getBuildings(),
      getCustomers(),
      getTechnicians(),
      getVendors(),
      getDevices(),
      getTickets(),
      getNotifications(),
      getSearchIndex(),
    ]);

  return (
    <html lang="id" className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
      <body>
        <AppShell
          reference={{ buildings, customers, technicians, vendors }}
          devices={devices}
          tickets={tickets}
          notifications={notifications}
          searchEntries={searchEntries}
        >
          {children}
        </AppShell>
      </body>
    </html>
  );
}
