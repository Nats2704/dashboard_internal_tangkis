import { cn } from "@/lib/utils/cn";

/** Tanda TANGKIS: tangki dengan garis level, digambar sebagai SVG sederhana. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden>
      <rect width="32" height="32" rx="7" fill="#1f8a7d" />
      <path
        d="M10 9.5h12a1.5 1.5 0 0 1 1.5 1.5v11.5a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3V11A1.5 1.5 0 0 1 10 9.5Z"
        fill="none"
        stroke="#e9f6f3"
        strokeWidth="1.8"
      />
      <path d="M8.5 17.5h15v5a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-5Z" fill="#e9f6f3" opacity="0.9" />
      <path d="M13 6.5h6" stroke="#e9f6f3" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark className="shrink-0" />
      {!collapsed ? (
        <div className="leading-none">
          <p className="text-[15px] font-semibold tracking-[0.14em] text-white">TANGKIS</p>
          <p className="mt-1 text-[11px] text-white/50">Monitoring Operasional</p>
        </div>
      ) : null}
    </div>
  );
}
