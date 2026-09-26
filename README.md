# TANGKIS · Frontend Dashboard

Frontend dashboard operasional TANGKIS: kesehatan unit, sensor, kontrak, tiket servis, stok, rujukan vendor, dan ekonomi per gedung. Semua data masih mock, tetapi alurnya sudah disiapkan supaya bisa diganti API tanpa membongkar komponen.

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:3000 (otomatis diarahkan ke /dashboard)
npm run build    # build produksi
npm run lint
```

Butuh Node.js 20.9 atau lebih baru. Font Geist dibundel lewat paket `geist`, jadi build tidak perlu mengunduh font dari Google. Peta memakai Leaflet dengan tile CARTO (tanpa API key). Kalau tile tidak bisa dimuat, marker unit tetap tampil dan muncul catatan kecil di peta.

## Stack

Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS 4, Recharts, Leaflet + react-leaflet, Lucide. State memakai React state dan Context, tanpa library state tambahan.

## Alur data

```
lib/mock-data/*        data contoh deterministik (seed tetap)
      ↓
lib/services/*         satu-satunya pintu ambil data (async)
      ↓
app/**/page.tsx        server component, memanggil service
      ↓
components/**          UI, hanya menerima props / context
```

Semua service memakai `load()` di `lib/services/source.ts`. Untuk pindah ke backend, isi `.env.local`:

```
TANGKIS_DATA_SOURCE=api
TANGKIS_API_URL=https://api.tangkis.id/v1
```

Endpoint yang diharapkan tertulis di tiap file service (misalnya `/devices`, `/sensors/trend?weeks=12`, `/tickets?period=2026-Q3`). Bentuk JSON-nya mengikuti tipe di folder `types/`.

Aksi tulis (assign teknisi, update firmware) ada di `lib/services/mutations.ts` dan saat ini disimulasikan dengan timeout. Ganti isinya dengan POST/PATCH, komponen pemanggil tidak perlu diubah.

Angka ringkasan (total unit, online, sensor normal, garansi hampir habis, dan seterusnya) tidak diketik manual. Semuanya dihitung dari data oleh fungsi murni di `lib/analytics/`, sehingga dashboard tetap konsisten ketika data berubah.

## Struktur folder

```
app/                    route: dashboard, devices, sensors, contracts, service,
                        inventory, vendors, economics, settings, profile
components/
  layout/               AppShell, Sidebar, Header, GlobalSearch, menu notifikasi & profil
  dashboard/            section Beranda (HeroSummary, DeviceOverview, SensorHealth, ...)
  devices/ sensors/ contracts/ service/ inventory/ vendors/ economics/
                        tabel, drawer, modal, dan "workspace" per domain
                        (dipakai ulang oleh dashboard dan halaman detail)
  providers/            FleetProvider, TicketProvider, ReferenceDataProvider
  ui/                   Button, Badge, Panel, Metric, Tabs, DataTable, Drawer, Modal,
                        Dropdown, Toast, SearchInput
lib/
  mock-data/            generator data contoh
  services/             lapisan akses data
  analytics/            perhitungan ringkasan (pure function)
  constants/            ambang alarm, label status, navigasi
  hooks/  utils/
types/                  tipe domain
```

## Catatan data contoh

Snapshot data dikunci pada 26 Sep 2026 pukul 08.00 WIB (`DATA_SNAPSHOT_AT`) supaya render server dan browser identik. Jam di header tetap waktu nyata.

Beberapa angka sengaja berbeda dari brief awal karena brief-nya saling bertabrakan:

- Unit online dan offline hanya dihitung dari 356 unit terpasang. Brief menulis online 432 + offline 36 = 468, padahal 78 unit masih di gudang.
- Kontrak hanya untuk unit terpasang dan yang sedang diperbaiki (378 unit), bukan seluruh 468.
- "Perlu kalibrasi" dihitung satu kali: 24 sensor yang tersebar di 23 unit.
- Firmware rilis terbaru v2.4.1, jadi pembaruan menargetkan 18 unit online yang masih v2.3.x. Satu unit lama lain (GM-014) sedang offline dan menunggu.
- Asumsi ekonomi dibaca sebagai Rp 1,9 jt per unit per tahun. Membandingkan biaya per gedung dengan satu angka tetap tidak adil karena jumlah unit tiap gedung berbeda (6 sampai 52 unit).
