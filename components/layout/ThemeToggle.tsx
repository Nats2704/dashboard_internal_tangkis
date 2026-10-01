"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/hooks/useTheme";

/** Tombol ganti mode gelap/terang di header. Ikon menunjukkan mode tujuan. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const next = theme === "light" ? "dark" : "light";
  const label = next === "light" ? "Ganti ke mode terang" : "Ganti ke mode gelap";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={label}
      title={label}
      // Saat render server tema belum diketahui: tombol dirender kosong agar tidak mismatch.
      disabled={theme === null}
      className="rounded-md p-2 text-ink-2 transition-colors hover:bg-hover hover:text-ink"
    >
      {theme === null ? (
        <span className="block size-[18px]" />
      ) : next === "light" ? (
        <Sun className="size-[18px]" strokeWidth={1.75} />
      ) : (
        <Moon className="size-[18px]" strokeWidth={1.75} />
      )}
    </button>
  );
}
