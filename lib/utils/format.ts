import { DATA_SNAPSHOT_AT } from "@/lib/constants";

/**
 * Formatter manual (bukan Intl) supaya keluaran identik di server dan
 * browser, apa pun locale dan zona waktu mesinnya. Semua tanggal ditampilkan
 * dalam WIB (UTC+7).
 */

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export const SNAPSHOT_MS = Date.parse(DATA_SNAPSHOT_AT);

function groupThousands(integer: string): string {
  return integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatNumber(value: number, decimals = 0): string {
  const negative = value < 0;
  const fixed = Math.abs(value).toFixed(decimals);
  const [integer, fraction] = fixed.split(".");
  const body = fraction
    ? `${groupThousands(integer)},${fraction}`
    : groupThousands(integer);
  return negative ? `−${body}` : body;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${formatNumber(value, decimals)}%`;
}

export function formatSignedPercent(value: number, decimals = 1): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "±";
  return `${sign}${formatNumber(Math.abs(value), decimals)}%`;
}

export function formatRupiah(value: number): string {
  return `Rp ${formatNumber(Math.round(value))}`;
}

/** Rp 48,7 jt · Rp 250 rb · Rp 1,2 M */
export function formatRupiahShort(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "−" : "";
  if (abs >= 1_000_000_000) {
    return `${sign}Rp ${formatNumber(abs / 1_000_000_000, 1)} M`;
  }
  if (abs >= 1_000_000) {
    return `${sign}Rp ${formatNumber(abs / 1_000_000, 1)} jt`;
  }
  if (abs >= 1_000) {
    return `${sign}Rp ${formatNumber(Math.round(abs / 1_000))} rb`;
  }
  return `${sign}Rp ${formatNumber(abs)}`;
}

export function formatDbm(value: number | null): string {
  return value === null ? "—" : `${formatNumber(value)} dBm`;
}

function toWib(iso: string): Date {
  return new Date(Date.parse(iso) + WIB_OFFSET_MS);
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = toWib(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatTime(iso: string): string {
  const d = toWib(iso);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}.${mm}`;
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return `${formatDate(iso)}, ${formatTime(iso)} WIB`;
}

export function formatLongDate(ms: number): string {
  const d = new Date(ms + WIB_OFFSET_MS);
  return `${DAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${
    MONTHS[d.getUTCMonth()]
  } ${d.getUTCFullYear()}`;
}

export function formatClock(ms: number): string {
  return formatTime(new Date(ms).toISOString());
}

export function hoursSince(iso: string, now = SNAPSHOT_MS): number {
  return (now - Date.parse(iso)) / HOUR_MS;
}

export function daysUntil(iso: string, now = SNAPSHOT_MS): number {
  return Math.ceil((Date.parse(iso) - now) / DAY_MS);
}

export function formatRelative(iso: string | null, now = SNAPSHOT_MS): string {
  if (!iso) return "—";
  const minutes = Math.max(0, Math.round((now - Date.parse(iso)) / 60000));
  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  if (days < 365) return `${Math.floor(days / 30)} bulan lalu`;
  return formatDate(iso);
}

export function formatDaysLeft(iso: string, now = SNAPSHOT_MS): string {
  const days = daysUntil(iso, now);
  if (days < 0) return `lewat ${Math.abs(days)} hari`;
  if (days === 0) return "hari ini";
  return `${days} hari lagi`;
}

export function greetingFor(ms: number): string {
  const hour = new Date(ms + WIB_OFFSET_MS).getUTCHours();
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}
