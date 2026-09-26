/**
 * PRNG deterministik (mulberry32). Mock data harus identik setiap build
 * supaya angka di dashboard tidak berubah-ubah antar-render.
 */
export function createRandom(seed: number) {
  let state = seed >>> 0;

  function next(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function float(min: number, max: number): number {
    return min + next() * (max - min);
  }

  function int(min: number, max: number): number {
    return Math.floor(float(min, max + 1));
  }

  function pick<T>(items: readonly T[]): T {
    return items[Math.floor(next() * items.length)];
  }

  /** Distribusi mendekati normal (Box–Muller). */
  function normal(mean: number, sd: number): number {
    const u = Math.max(next(), 1e-9);
    const v = next();
    return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function shuffle<T>(items: readonly T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  return { next, float, int, pick, normal, shuffle };
}

export type Random = ReturnType<typeof createRandom>;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function round(value: number, decimals = 0): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

const HOUR_MS = 60 * 60 * 1000;

export function isoOffset(baseMs: number, hours: number): string {
  return new Date(baseMs - hours * HOUR_MS).toISOString();
}

export function addMonths(isoDate: string, months: number): string {
  const [y0, m0, d0] = isoDate.split("-").map(Number);
  const target = new Date(Date.UTC(y0, m0 - 1 + months, d0));
  const y = target.getUTCFullYear();
  const m = String(target.getUTCMonth() + 1).padStart(2, "0");
  const day = String(target.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(isoDate: string, days: number): string {
  const ms = Date.parse(`${isoDate}T00:00:00Z`) + days * 24 * HOUR_MS;
  return new Date(ms).toISOString().slice(0, 10);
}

/** Tanggal "YYYY-MM-DD" ke ISO pukul tertentu WIB. */
export function wib(date: string, time = "09:00"): string {
  return `${date}T${time}:00+07:00`;
}

/** Membulatkan ke kelipatan terdekat, misalnya 10.000 rupiah. */
export function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}
