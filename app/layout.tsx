import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AppShell } from "@/components/layout/AppShell";
import { getBuildings, getCustomers } from "@/lib/services/buildingService";
import { getDevices } from "@/lib/services/deviceService";
import { getTechnicians, getTickets } from "@/lib/services/ticketService";
import { getVendors } from "@/lib/services/vendorService";
import { getNotifications, getSearchIndex } from "@/lib/services/notificationService";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
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
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#090e15" },
    { media: "(prefers-color-scheme: light)", color: "#f3f5f8" },
  ],
  colorScheme: "dark light",
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
    // data-theme diganti oleh THEME_INIT_SCRIPT sebelum hydrate, jadi selisihnya disengaja.
    <html
      lang="id"
      data-theme="dark"
      className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Script biasa, bukan next/script: beforeInteractive versi inline baru
            dijalankan setelah runtime Next termuat, jadi tema terang sempat
            berkedip gelap. Ini harus jalan sinkron sebelum paint. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
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
