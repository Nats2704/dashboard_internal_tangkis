"use client";

import { useSyncExternalStore } from "react";

let listeners: (() => void)[] = [];
let timer: ReturnType<typeof setInterval> | null = null;
let current = 0;

function subscribe(listener: () => void) {
  listeners.push(listener);
  if (!timer) {
    current = Date.now();
    timer = setInterval(() => {
      current = Date.now();
      listeners.forEach((l) => l());
    }, 1000);
  }
  return () => {
    listeners = listeners.filter((l) => l !== listener);
    if (listeners.length === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

function getSnapshot() {
  if (current === 0) current = Date.now();
  return current;
}

/**
 * Jam detik untuk header. Terpisah dari useNow (30 detik) supaya komponen lain
 * tidak ikut render ulang tiap detik. Null saat render server.
 */
export function useClock(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
