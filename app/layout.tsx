import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import { AppShell } from "@/components/layout/AppShell";
import { getBuildings, getCustomers } from "@/lib/services/buildingService";
import { getDevices } from "@/lib/services/deviceService";
import { getTechnicians, getTickets } from "@/lib/services/ticketService";
import { getVendors } from "@/lib/services/vendorService";
import { getNotifications, getSearchIndex } from "@/lib/services/notificationService";
import "./globals.css";

// H1: Plus Jakarta Sans Bold · H2: Satoshi (Fontshare, di-host sendiri) · teks lain: Space Grotesk.
const display = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["700"], variable: "--font-jakarta" });
const heading = localFont({
  src: [
    { path: "./fonts/Satoshi-Medium.woff2", weight: "500" },
    { path: "./fonts/Satoshi-Bold.woff2", weight: "700" },
  ],
  variable: "--font-satoshi",
});
const body = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-space" });

export const metadata: Metadata = {
  title: {
    default: "TANGKIS · Monitoring Operasional",
    template: "%s · TANGKIS",
  },
  description:
    "Pemantauan kesehatan unit, sensor, kontrak, servis, stok, vendor, dan ekonomi per gedung.",
};

export const viewport: Viewport = {
  themeColor: "#0f2a25",
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
    <html lang="id" className={`${display.variable} ${heading.variable} ${body.variable} antialiased`}>
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
