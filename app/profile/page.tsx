import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { Panel, SectionHeader } from "@/components/ui/Panel";
import { DetailList } from "@/components/ui/DetailList";
import { Avatar } from "@/components/layout/ProfileMenu";
import { CURRENT_USER } from "@/lib/constants/navigation";

export const metadata: Metadata = { title: "Profil" };

export default function ProfilePage() {
  return (
    <PageContainer narrow>
      <PageHeader title="Profil" />
      <Panel labelledBy="akun-title">
        <SectionHeader id="akun-title" title="Akun" description="Autentikasi belum aktif di prototipe ini." />
        <div className="flex flex-col gap-6 px-5 py-5 sm:flex-row sm:items-start">
          <Avatar className="size-14 text-[18px]" />
          <DetailList
            className="flex-1"
            items={[
              { label: "Nama", value: CURRENT_USER.name },
              { label: "Peran", value: CURRENT_USER.role },
              { label: "Email", value: CURRENT_USER.email },
              { label: "Akses", value: "Semua gedung" },
            ]}
          />
        </div>
      </Panel>
    </PageContainer>
  );
}
