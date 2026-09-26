/**
 * Titik tunggal pergantian sumber data.
 *
 * Mode "mock" (default) mengambil data dari lib/mock-data. Untuk beralih ke
 * backend, set TANGKIS_DATA_SOURCE=api dan TANGKIS_API_URL di .env.local.
 * Komponen UI tidak perlu diubah karena hanya memanggil fungsi service.
 */
export type DataSource = "mock" | "api";

export const DATA_SOURCE: DataSource =
  process.env.TANGKIS_DATA_SOURCE === "api" ? "api" : "mock";

async function apiGet<T>(path: string): Promise<T> {
  const base = process.env.TANGKIS_API_URL;
  if (!base) {
    throw new Error("TANGKIS_API_URL belum diatur, sementara TANGKIS_DATA_SOURCE=api");
  }
  const response = await fetch(`${base}${path}`, { next: { revalidate: 60 } });
  if (!response.ok) {
    throw new Error(`Gagal memuat ${path}: ${response.status}`);
  }
  return (await response.json()) as T;
}

/**
 * Mengambil data dari API atau mock. Data mock di-clone supaya perubahan
 * state di satu halaman tidak bocor ke render lain.
 */
export async function load<T>(apiPath: string, mock: () => T): Promise<T> {
  if (DATA_SOURCE === "api") return apiGet<T>(apiPath);
  return structuredClone(mock());
}
