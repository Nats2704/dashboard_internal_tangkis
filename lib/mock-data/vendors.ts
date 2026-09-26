import type {
  Vendor,
  VendorRequest,
  VendorRequestStatus,
  VendorServiceType,
} from "@/types/vendor";
import { SNAPSHOT_MS } from "@/lib/utils/format";
import { mockDevices } from "./devices";
import { createRandom, isoOffset, roundTo } from "./random";

const rng = createRandom(2503);

export const mockVendors: Vendor[] = [
  { id: "ven-01", name: "PT Bersih Tangki Nusantara", service: "cleaning", city: "Tangerang", contact: "Hendra Wijaya · 0811-1920-334" },
  { id: "ven-02", name: "CV Mitra Genset Utama", service: "maintenance", city: "Jakarta Timur", contact: "Siti Rahmawati · 0812-7730-118" },
  { id: "ven-03", name: "PT Solar Andalan Energi", service: "fuel_supply", city: "Bekasi", contact: "Bambang Hartono · 0813-4401-562" },
  { id: "ven-04", name: "PT Klarifuel Indonesia", service: "fuel_polishing", city: "Jakarta Utara", contact: "Kevin Tanoto · 0817-0092-451" },
  { id: "ven-05", name: "PT Kalibra Instrumen", service: "calibration", city: "Bandung", contact: "Dewi Lestari · 0822-6613-907" },
];

const vendorByService = new Map(mockVendors.map((v) => [v.service, v]));

interface ServiceProfile {
  jobValue: [number, number];
  rate: number;
  notes: string[];
}

const PROFILES: Record<VendorServiceType, ServiceProfile> = {
  cleaning: {
    jobValue: [2_200_000, 4_500_000],
    rate: 0.1,
    notes: [
      "Kadar air naik tiga minggu berturut-turut, rekomendasi kuras dasar tangki",
      "Endapan terdeteksi saat inspeksi, pelanggan setuju pembersihan",
    ],
  },
  maintenance: {
    jobValue: [3_000_000, 8_500_000],
    rate: 0.1,
    notes: [
      "Genset belum servis 500 jam operasi",
      "Pelanggan minta paket perawatan tahunan genset",
    ],
  },
  fuel_supply: {
    jobValue: [18_000_000, 46_000_000],
    rate: 0.02,
    notes: [
      "Level di bawah 30%, pengisian ulang sebelum musim hujan",
      "Stok BBM kurang dari kebutuhan 48 jam sesuai SOP pelanggan",
    ],
  },
  fuel_polishing: {
    jobValue: [4_500_000, 9_000_000],
    rate: 0.08,
    notes: [
      "BBM disimpan lebih dari 9 bulan, perlu filtrasi",
      "Hasil lab menunjukkan kontaminasi mikroba",
    ],
  },
  calibration: {
    jobValue: [1_500_000, 3_000_000],
    rate: 0.12,
    notes: ["Sampling lab triwulan untuk verifikasi sensor"],
  },
};

const PLAN: { service: VendorServiceType; status: VendorRequestStatus }[] = [
  { service: "cleaning", status: "done" },
  { service: "fuel_supply", status: "done" },
  { service: "maintenance", status: "done" },
  { service: "calibration", status: "done" },
  { service: "cleaning", status: "done" },
  { service: "fuel_polishing", status: "done" },
  { service: "fuel_supply", status: "done" },
  { service: "maintenance", status: "done" },
  { service: "cleaning", status: "done" },
  { service: "fuel_supply", status: "in_progress" },
  { service: "maintenance", status: "in_progress" },
  { service: "fuel_polishing", status: "in_progress" },
  { service: "calibration", status: "in_progress" },
  { service: "cleaning", status: "waiting" },
  { service: "fuel_supply", status: "waiting" },
  { service: "maintenance", status: "waiting" },
  { service: "fuel_polishing", status: "waiting" },
  { service: "cleaning", status: "waiting" },
];

function buildRequests(): VendorRequest[] {
  const units = rng.shuffle(
    mockDevices.filter((d) => d.lifecycle === "installed" && !["GM-001", "UNIV-003"].includes(d.id))
  );

  const requests: VendorRequest[] = PLAN.map((item, index) => {
    const profile = PROFILES[item.service];
    const device = units[index];
    const jobValue = roundTo(rng.float(profile.jobValue[0], profile.jobValue[1]), 50_000);
    const daysAgo =
      item.status === "done" ? rng.int(12, 80) : item.status === "in_progress" ? rng.int(3, 12) : rng.int(0, 4);
    const requestedAt = isoOffset(SNAPSHOT_MS, daysAgo * 24 + rng.int(0, 8));
    return {
      id: "",
      service: item.service,
      deviceId: device.id,
      buildingId: device.buildingId as string,
      vendorId: (vendorByService.get(item.service) as Vendor).id,
      status: item.status,
      jobValue,
      commission: roundTo(jobValue * profile.rate, 10_000),
      requestedAt,
      completedAt:
        item.status === "done" ? isoOffset(Date.parse(requestedAt), -rng.int(2, 9) * 24) : null,
      note: rng.pick(profile.notes),
    };
  });

  const gm001 = mockDevices.find((d) => d.id === "GM-001");
  const univ003 = mockDevices.find((d) => d.id === "UNIV-003");
  if (gm001) {
    requests.push({
      id: "",
      service: "cleaning",
      deviceId: gm001.id,
      buildingId: gm001.buildingId as string,
      vendorId: "ven-01",
      status: "in_progress",
      jobValue: 2_500_000,
      commission: 250_000,
      requestedAt: isoOffset(SNAPSHOT_MS, 26),
      completedAt: null,
      note: "Kadar air tangki harian naik ke 340 ppm, pelanggan setuju pembersihan",
    });
  }
  if (univ003) {
    requests.push({
      id: "",
      service: "maintenance",
      deviceId: univ003.id,
      buildingId: univ003.buildingId as string,
      vendorId: "ven-02",
      status: "done",
      jobValue: 4_000_000,
      commission: 400_000,
      requestedAt: isoOffset(SNAPSHOT_MS, 6 * 24 + 3),
      completedAt: isoOffset(SNAPSHOT_MS, 2 * 24),
      note: "Servis 500 jam genset kampus, termasuk ganti filter solar",
    });
  }

  return requests
    .sort((a, b) => Date.parse(b.requestedAt) - Date.parse(a.requestedAt))
    .map((r, i, all) => ({ ...r, id: `RJK-${String(2600 + all.length - i).padStart(4, "0")}` }));
}

export const mockVendorRequests: VendorRequest[] = buildRequests();
