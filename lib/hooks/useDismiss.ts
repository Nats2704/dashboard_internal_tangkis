"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Tumpukan lapisan yang terbuka (dropdown, drawer, modal). Escape hanya
 * menutup lapisan paling atas, jadi modal di atas drawer tidak ikut menutup
 * drawer.
 */
const stack: symbol[] = [];
const NO_REFS: RefObject<HTMLElement | null>[] = [];

export function useDismiss(
  active: boolean,
  onDismiss: () => void,
  refs: RefObject<HTMLElement | null>[] = NO_REFS
) {
  const dismissRef = useRef(onDismiss);
  useEffect(() => {
    dismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!active) return;
    const token = Symbol("layer");
    stack.push(token);

    function handleKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (stack[stack.length - 1] !== token) return;
      event.stopPropagation();
      dismissRef.current();
    }
    function handlePointer(event: MouseEvent) {
      if (refs.length === 0) return;
      const target = event.target as Node;
      if (refs.every((ref) => ref.current && !ref.current.contains(target))) {
        dismissRef.current();
      }
    }

    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handlePointer);
    return () => {
      const index = stack.indexOf(token);
      if (index >= 0) stack.splice(index, 1);
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handlePointer);
    };
  }, [active, refs]);
}
