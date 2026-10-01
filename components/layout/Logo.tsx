import Image from "next/image";
import { cn } from "@/lib/utils/cn";

/** Lambang TANGKIS: koper dengan petir, aset resmi brand. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/logo-mark.png"
      alt=""
      width={1784}
      height={1482}
      priority
      className={cn("h-7 w-auto shrink-0", className)}
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
            wordmark-tight.png: wordmark resmi dengan ruang kosong transparan di
            sekelilingnya dipangkas, supaya hurufnya terbaca besar (versi asli
            hanya ~30% tinggi gambar). Hijau tua aslinya tenggelam di sidebar
            gelap, jadi di mode gelap brightness-0 invert mewarnainya putih
            polos tanpa merusak alpha PNG; di mode terang warna brand asli tampil.
          */}
          <Image
            src="/brand/wordmark-tight.png"
            alt="TANGKIS"
            width={1849}
            height={241}
            priority
            className="h-[14px] w-auto brightness-0 invert light:brightness-100 light:invert-0"
          />
          <p className="mt-1.5 text-[10.5px] tracking-[0.06em] text-subtle uppercase">Monitoring Operasional</p>
        </div>
      ) : null}
    </div>
  );
}
