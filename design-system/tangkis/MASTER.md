# TANGKIS · Design System

Arah: **mission control untuk infrastruktur daya kritis**. Dipakai operator TANGKIS untuk memantau ratusan unit pemantau BBM di gedung pelanggan. Prinsip utamanya: *tampilkan dulu yang perlu perhatian*.

## Hierarki halaman

Alarm kritis → status armada → metrik kunci → tren → pemantauan rinci → log/tabel.

Ukuran dan posisi panel mengikuti urutan itu. Tidak semua informasi mendapat bobot visual yang sama.

## Warna

Dua mode: gelap (bawaan) dan terang. Token ada di `app/globals.css`: nilai gelap di `@theme`, nilai terang menimpa token yang sama di `:root[data-theme="light"]`. Tema dipasang oleh script inline di `<head>` (`lib/theme.ts`) sebelum paint, lalu diubah lewat tombol di header (`useTheme`, disimpan di localStorage). Komponen hanya memakai token, tidak memakai hex atau `bg-white/[..]` langsung; overlay netral memakai `hover`, `fill`, `fill-strong`, bayangan memakai `var(--color-shadow)`. Library yang menerima warna lewat props (Recharts, Leaflet) memakai `lib/constants/chart.ts`, yang berisi referensi `var(--color-*)` sehingga ikut berganti mode. Penyesuaian yang tidak bisa diwakili token memakai varian `light:`.

| Lapisan   | Token      | Pakai untuk                         |
| --------- | ---------- | ----------------------------------- |
| Latar     | `canvas`   | halaman                             |
| Sumur     | `sunken`   | input, area peta, isi bar           |
| Panel     | `surface`  | kartu dan section                   |
| Melayang  | `elevated` | dropdown, drawer, modal, tooltip    |
| Garis     | `line`, `line-strong` | pemisah 1px, tanpa bayangan tebal |

Status, dipakai di titik, aksen kecil, teks, ikon, dan grafik. **Tidak pernah mewarnai seluruh kartu.**

| Status   | Token     | Arti di TANGKIS                                      |
| -------- | --------- | ---------------------------------------------------- |
| Sehat    | `success` | unit online, sensor normal                           |
| Perhatian| `warning` | maintenance, kalibrasi, baterai/sinyal lemah         |
| Kritis   | `danger`  | unit offline (data berhenti), sensor macet/di luar rentang |
| Netral   | `subtle`  | tanpa data, gudang, nilai tidak berlaku              |
| Info     | `info`    | sewa, tarikan, catatan                               |

Catatan: di produk ini unit *offline* berarti pemantauan tangki berhenti, jadi tetap merah (kritis), bukan abu-abu.

Aksen `accent` (teal dari ikon TANGKIS) hanya untuk elemen interaktif dan indikator aktif.

## Tipografi

- Geist Sans untuk semua teks, Geist Mono untuk kode unit, ID, nomor seri, firmware.
- Angka telemetri adalah titik fokus: besar, `tabular-nums`, satuan kecil dan redup di sebelahnya (`4,2 mm`, bukan `Water Content: 4,2 mm`).
- Label kelompok memakai utilitas `eyebrow` (11px, kapital, renggang).
- Teks isi minimum 12px.

## Bentuk

- Radius: kontrol 4px, panel 8px. Tidak ada pill besar kecuali badge hitungan.
- Kartu tidak bergaya "border + bayangan + judul + angka". Jenis kartu: Hero, Insight, Equipment, Alert, Chart, Status. Masing-masing punya hierarki sendiri.
- Gradien hanya dua: cahaya radial halus di latar dan isi area grafik.

## Gerak

- Durasi 160–520ms, `ease-out-soft`. Animasi tak berujung hanya untuk hal yang memang hidup: denyut status kritis, aliran data jaringan, permukaan BBM.
- Animasi yang memakai `transform` hanya di elemen daun. Pembungkus halaman memakai fade opacity saja karena `transform` pada induk menggeser drawer/modal yang `fixed`.
- Semua gerak mati bila `prefers-reduced-motion: reduce`.

## Data

Semua angka dihitung dari data lewat fungsi di `lib/analytics/`. Tidak ada angka atau grafik yang dikarang untuk mengisi ruang. Bila sebuah visual butuh data yang belum ada di backend (misalnya beban genset atau runtime), visual itu tidak dibuat.
