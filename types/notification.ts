export type NotificationSeverity = "critical" | "warning" | "info";

export interface AppNotification {
  id: string;
  severity: NotificationSeverity;
  title: string;
  description: string;
  href: string;
  createdAt: string;
  /** Unit yang menjadi pokok alarm, bila alarm menyangkut satu unit. Opsional. */
  deviceId?: string;
}

export type SearchResultKind = "device" | "building" | "ticket";

export interface SearchEntry {
  kind: SearchResultKind;
  id: string;
  title: string;
  subtitle: string;
  status: string | null;
  meta: string | null;
  href: string;
  keywords: string;
}
