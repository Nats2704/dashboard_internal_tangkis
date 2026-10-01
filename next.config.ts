import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Folder induk juga punya package-lock.json, jadi Next salah menebak root
  // workspace. Kunci root ke folder proyek ini sendiri.
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Indikator route Next.js default muncul di bawah-kiri dan menimpa baris
  // "Ciutkan" sidebar kita. bottom-left/top-left menabrak sidebar (logo di
  // atas, Ciutkan di bawah); top-right menabrak header (notifikasi/profil).
  // bottom-right jatuh di area konten kosong di semua halaman kita, jadi
  // paling aman. Ini murni dev-mode (hilang total di build produksi), dan
  // posisinya cuma bisa diatur lewat empat preset ini, bukan teks bebas.
  devIndicators: {
    position: "bottom-right",
  },
};

export default nextConfig;
