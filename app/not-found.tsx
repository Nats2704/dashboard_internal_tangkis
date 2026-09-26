import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { buttonClasses } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <PageContainer className="flex min-h-[60vh] flex-col items-start justify-center">
      <p className="text-[13px] text-muted">404</p>
      <h1 className="mt-1 text-[24px] font-semibold tracking-tight">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-[14px] text-muted">Tautan mungkin sudah berubah atau unit sudah dipindahkan.</p>
      <Link href="/dashboard" className={`${buttonClasses("primary", "md")} mt-5`}>
        Kembali ke Beranda
      </Link>
    </PageContainer>
  );
}
