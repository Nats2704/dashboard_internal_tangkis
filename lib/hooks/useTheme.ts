"use client";

import { useCallback, useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

// Sumber kebenaran tema adalah atribut data-theme di <html>, yang dipasang oleh
// THEME_INIT_SCRIPT sebelum hydrate. Hook ini hanya membaca dan mengubahnya.
let listeners: (() => void)[] = [];

function emit() {
  listeners.forEach((l) => l());
}

function onStorage(e: StorageEvent) {
  // Sinkron antar-tab: tab lain mengganti tema, tab ini ikut.
  if (e.key !== THEME_STORAGE_KEY || (e.newValue !== "light" && e.newValue !== "dark")) return;
  apply(e.newValue);
  emit();
}

function subscribe(listener: () => void) {
  if (listeners.length === 0) window.addEventListener("storage", onStorage);
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
    if (listeners.length === 0) window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function apply(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

/**
 * Tema aktif dan pengubahnya. Mengembalikan null saat render server, karena
 * tema baru diketahui setelah script di <head> membaca localStorage.
 */
export function useTheme() {
  const theme = useSyncExternalStore<Theme | null>(subscribe, getSnapshot, () => null);

  const setTheme = useCallback((next: Theme) => {
    const commit = () => {
      apply(next);
      emit();
    };
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Mode privat atau storage diblokir: tema tetap berganti untuk sesi ini.
    }
    // Cross-fade singkat lewat View Transitions bila didukung dan gerak tidak dibatasi.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce && "startViewTransition" in document) document.startViewTransition(commit);
    else commit();
  }, []);

  return { theme, setTheme };
}
