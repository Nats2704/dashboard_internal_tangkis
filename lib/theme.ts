export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "tangkis-theme";

/**
 * Menentukan tema awal saat halaman dibuka.
 *
 * - `stored`: pilihan terakhir pengguna dari localStorage (null bila belum pernah memilih
 *   atau nilainya rusak).
 * - `systemPrefersDark`: hasil media query `prefers-color-scheme: dark` di OS/browser.
 *
 * Fungsi ini diserialisasi ke script inline di <head> (lihat THEME_INIT_SCRIPT), jadi
 * harus murni: tanpa import, tanpa closure, hanya memakai kedua argumennya.
 */
export function resolveTheme(stored: Theme | null, systemPrefersDark: boolean): Theme {
  // TODO(human): tentukan tema awal dari pilihan tersimpan dan preferensi sistem.
  return stored ?? "dark";
}

/**
 * Dijalankan di <head> sebelum halaman di-paint, supaya tidak ada kilatan tema
 * yang salah sebelum React hydrate.
 */
export const THEME_INIT_SCRIPT = `(function(){try{
var s=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
if(s!=="light"&&s!=="dark")s=null;
var d=window.matchMedia("(prefers-color-scheme: dark)").matches;
var t=(${resolveTheme.toString()})(s,d);
var r=document.documentElement;r.dataset.theme=t;r.style.colorScheme=t;
}catch(e){}})();`;
