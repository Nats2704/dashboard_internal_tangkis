import type { ReactNode } from "react";

/** Template di-remount tiap pindah halaman: konten masuk dengan fade singkat. */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
