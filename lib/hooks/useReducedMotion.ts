"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(listener: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", listener);
  return () => mql.removeEventListener("change", listener);
}

/**
 * True bila pengguna meminta gerak dikurangi. Dipakai untuk animasi berbasis
 * JavaScript (Recharts) yang tidak terjangkau aturan CSS global. Saat render
 * server dianggap true supaya tidak ada animasi sebelum hidrasi.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => true
  );
}
