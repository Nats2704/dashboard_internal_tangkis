import Image from "next/image";
import { cn } from "@/lib/utils/cn";

/** Lambar TANGKIS: koper dengan petir, aset resmi brand. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/logo-mark.png"
      alt=""
      width={1784}
      height={1482}
      priority
      className={cn("h-8 w-auto shrink-0", className)}
    />
  );
}

export function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark />
      {!collapsed ? (
        <div className="leading-none">
          {/*
            Wordmark aslinya hijau tua di atas transparan: di sidebar hijau
            gelap teksnya tenggelam. brightness-0 invert mewarnai ulang
            bentuk hurufnya jadi putih polos (alpha PNG tetap terjaga),
            tanpa alas atau blur tambahan — sama seperti perlakuan subjudul
            di bawahnya.
          */}
          <Image
            src="/brand/wordmark.png"
            alt="TANGKIS"
            width={2172}
            height={724}
            priority
            className="h-[15px] w-auto brightness-0 invert"
          />
          <p className="mt-1.5 text-[11px] text-white/50">Monitoring Operasional</p>
        </div>
      ) : null}
    </div>
  );
}
