import type { Building, BuildingCategory, Customer } from "@/types/building";
import type { Ownership } from "@/types/contract";

/**
 * Konfigurasi seed per gedung. Field di luar tipe Building (jumlah unit,
 * kepemilikan, tanggal kontrak) hanya dipakai generator mock dan tidak
 * diekspos ke UI. Di backend, informasi ini berasal dari tabel kontrak.
 */
interface BuildingSeed {
  code: string;
  name: string;
  customer: string;
  city: string;
  area: string;
  lat: number;
  lng: number;
  category: BuildingCategory;
  ownership: Ownership;
  contractStart: string;
  installed: number;
  repair: number;
  returned: number;
}

const SEEDS: BuildingSeed[] = [
  { code: "GM", name: "Gedung Mandiri", customer: "PT Graha Mandiri Sejahtera", city: "Jakarta Pusat", area: "Thamrin", lat: -6.1935, lng: 106.8229, category: "office", ownership: "owned", contractStart: "2025-02-10", installed: 16, repair: 1, returned: 0 },
  { code: "MTK", name: "Menara Kencana", customer: "PT Kencana Properti Indah", city: "Jakarta Selatan", area: "Kuningan", lat: -6.2297, lng: 106.8295, category: "office", ownership: "rental", contractStart: "2025-03-01", installed: 14, repair: 0, returned: 0 },
  { code: "TLA", name: "Tower Lintas Artha", customer: "PT Lintas Artha Realty", city: "Jakarta Selatan", area: "Mega Kuningan", lat: -6.2352, lng: 106.8262, category: "office", ownership: "owned", contractStart: "2025-05-19", installed: 12, repair: 0, returned: 0 },
  { code: "DCB", name: "Data Center Bintaro", customer: "PT Arunika Data Nusantara", city: "Tangerang Selatan", area: "Bintaro", lat: -6.2722, lng: 106.7224, category: "datacenter", ownership: "rental", contractStart: "2024-08-01", installed: 28, repair: 2, returned: 0 },
  { code: "DCC", name: "Data Center Cikarang", customer: "PT Arunika Data Nusantara", city: "Bekasi", area: "Cikarang Selatan", lat: -6.3335, lng: 107.1614, category: "datacenter", ownership: "rental", contractStart: "2025-01-06", installed: 22, repair: 0, returned: 0 },
  { code: "MTN", name: "Klaster BTS Tangsel", customer: "PT Menara Telekom Nusantara", city: "Tangerang Selatan", area: "Pondok Aren", lat: -6.2656, lng: 106.6981, category: "telco", ownership: "owned", contractStart: "2025-06-02", installed: 52, repair: 5, returned: 0 },
  { code: "MTB", name: "Klaster BTS Bekasi", customer: "PT Menara Telekom Nusantara", city: "Bekasi", area: "Bekasi Barat", lat: -6.2383, lng: 106.9756, category: "telco", ownership: "owned", contractStart: "2025-09-15", installed: 40, repair: 4, returned: 0 },
  { code: "PMJ", name: "Gudang PT Maju Jaya", customer: "PT Maju Jaya Logistik", city: "Bekasi", area: "Cikarang Barat", lat: -6.2975, lng: 107.1095, category: "industrial", ownership: "owned", contractStart: "2024-06-03", installed: 10, repair: 1, returned: 0 },
  { code: "UNIV", name: "Universitas Nusa Bangsa", customer: "Yayasan Pendidikan Nusa Bangsa", city: "Depok", area: "Beji", lat: -6.3629, lng: 106.8243, category: "education", ownership: "owned", contractStart: "2025-01-13", installed: 12, repair: 0, returned: 0 },
  { code: "RSH", name: "RS Harapan Sehat", customer: "PT Harapan Sehat Medika", city: "Tangerang", area: "Karawaci", lat: -6.2186, lng: 106.6119, category: "hospital", ownership: "owned", contractStart: "2025-07-07", installed: 22, repair: 2, returned: 0 },
  { code: "RSM", name: "RS Medika Bogor", customer: "PT Medika Bogor Utama", city: "Bogor", area: "Bogor Tengah", lat: -6.595, lng: 106.797, category: "hospital", ownership: "rental", contractStart: "2024-12-02", installed: 14, repair: 1, returned: 0 },
  { code: "MSR", name: "Mall Serpong Raya", customer: "PT Serpong Raya Properti", city: "Tangerang", area: "BSD City", lat: -6.3017, lng: 106.6527, category: "retail", ownership: "owned", contractStart: "2024-03-18", installed: 16, repair: 2, returned: 0 },
  { code: "PLC", name: "Plaza Cendana", customer: "PT Cendana Graha Niaga", city: "Jakarta Barat", area: "Grogol", lat: -6.1683, lng: 106.789, category: "retail", ownership: "rental", contractStart: "2023-09-04", installed: 0, repair: 0, returned: 7 },
  { code: "HSK", name: "Hotel Samudra Kemayoran", customer: "PT Samudra Hospitality", city: "Jakarta Pusat", area: "Kemayoran", lat: -6.158, lng: 106.8466, category: "hotel", ownership: "rental", contractStart: "2024-05-06", installed: 6, repair: 0, returned: 5 },
  { code: "ATK", name: "Apartemen Taman Kemang", customer: "PPPSRS Taman Kemang", city: "Jakarta Selatan", area: "Kemang", lat: -6.2605, lng: 106.8134, category: "residential", ownership: "owned", contractStart: "2025-08-11", installed: 8, repair: 0, returned: 0 },
  { code: "STB", name: "Pabrik Sinar Tekstil", customer: "PT Sinar Tekstil Bandung", city: "Cimahi", area: "Leuwigajah", lat: -6.8841, lng: 107.5413, category: "industrial", ownership: "owned", contractStart: "2025-04-14", installed: 12, repair: 1, returned: 0 },
  { code: "DOP", name: "Dago Office Park", customer: "PT Priangan Graha", city: "Bandung", area: "Dago", lat: -6.8856, lng: 107.6135, category: "office", ownership: "rental", contractStart: "2025-10-01", installed: 8, repair: 0, returned: 0 },
  { code: "KKU", name: "Pabrik Kimia Karya Utama", customer: "PT Kimia Karya Utama", city: "Bekasi", area: "Jababeka", lat: -6.2893, lng: 107.1483, category: "industrial", ownership: "owned", contractStart: "2026-01-19", installed: 10, repair: 0, returned: 0 },
  { code: "SPJ", name: "Sekolah Pelita Jaya", customer: "Yayasan Pelita Jaya", city: "Tangerang Selatan", area: "Bintaro", lat: -6.2766, lng: 106.7397, category: "education", ownership: "owned", contractStart: "2024-11-05", installed: 6, repair: 0, returned: 0 },
  { code: "WTC", name: "Wisma Tirta Cemerlang", customer: "PT Tirta Cemerlang", city: "Jakarta Utara", area: "Sunter", lat: -6.1386, lng: 106.8662, category: "office", ownership: "rental", contractStart: "2025-06-16", installed: 10, repair: 1, returned: 0 },
  { code: "LBP", name: "Laboratorium BioPrima", customer: "PT BioPrima Diagnostika", city: "Jakarta Timur", area: "Pulogadung", lat: -6.1897, lng: 106.9064, category: "laboratory", ownership: "owned", contractStart: "2025-03-03", installed: 8, repair: 0, returned: 0 },
  { code: "GBC", name: "Gudang Beku Cakung", customer: "PT Arktika Pangan", city: "Jakarta Timur", area: "Cakung", lat: -6.1739, lng: 106.9408, category: "industrial", ownership: "rental", contractStart: "2024-02-12", installed: 12, repair: 2, returned: 0 },
  { code: "RSB", name: "RS Bunda Kasih", customer: "PT Bunda Kasih Medika", city: "Bekasi", area: "Bekasi Selatan", lat: -6.2489, lng: 107.001, category: "hospital", ownership: "rental", contractStart: "2025-11-03", installed: 12, repair: 0, returned: 0 },
  { code: "POL", name: "Politeknik Priangan", customer: "Yayasan Politeknik Priangan", city: "Bandung", area: "Coblong", lat: -6.9047, lng: 107.6098, category: "education", ownership: "owned", contractStart: "2026-02-09", installed: 6, repair: 0, returned: 0 },
];

function slug(code: string): string {
  return `bld-${code.toLowerCase()}`;
}

const customerIds = new Map<string, string>();
for (const seed of SEEDS) {
  if (!customerIds.has(seed.customer)) {
    customerIds.set(seed.customer, `cus-${String(customerIds.size + 1).padStart(3, "0")}`);
  }
}

export const mockCustomers: Customer[] = [...customerIds.entries()].map(
  ([name, id]) => ({ id, name })
);

export const mockBuildings: Building[] = SEEDS.map((seed) => ({
  id: slug(seed.code),
  code: seed.code,
  name: seed.name,
  customerId: customerIds.get(seed.customer) as string,
  city: seed.city,
  area: seed.area,
  lat: seed.lat,
  lng: seed.lng,
  category: seed.category,
}));

export interface BuildingPlan {
  buildingId: string;
  code: string;
  customerId: string;
  ownership: Ownership;
  contractStart: string;
  installed: number;
  repair: number;
  returned: number;
}

export const buildingPlans: BuildingPlan[] = SEEDS.map((seed) => ({
  buildingId: slug(seed.code),
  code: seed.code,
  customerId: customerIds.get(seed.customer) as string,
  ownership: seed.ownership,
  contractStart: seed.contractStart,
  installed: seed.installed,
  repair: seed.repair,
  returned: seed.returned,
}));
