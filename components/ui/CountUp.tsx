"use client";

import { useEffect, useRef, useState } from "react";
import { formatNumber } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

/**
 * Angka yang menghitung naik saat pertama terlihat, dan beranimasi dari nilai
 * lama ke nilai baru saat data berubah (mis. setelah update firmware).
 * Render server menampilkan nilai akhir; animasi dilewati bila pengguna
 * meminta gerak dikurangi.
 */
export function CountUp({
  value,
  decimals = 0,
  duration = 900,
  className,
}: {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // Nilai antara selama animasi; null berarti tampilkan nilai akhir.
  const [frame, setFrame] = useState<number | null>(null);
  const shown = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    function run(from: number) {
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setFrame(p < 1 ? from + (value - from) * eased : null);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    if (reduce) {
      shown.current = value;
      return;
    }

    if (shown.current !== null) {
      const from = shown.current;
      shown.current = value;
      if (from !== value) run(from);
      return () => cancelAnimationFrame(raf);
    }

    // Pertama kali: tunggu sampai angka masuk layar.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        shown.current = value;
        run(0);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={cn("tabular", className)}>
      {formatNumber(frame ?? value, decimals)}
    </span>
  );
}
