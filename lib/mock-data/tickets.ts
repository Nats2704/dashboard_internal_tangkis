import type {
  ServiceTicket,
  Technician,
  TicketCause,
  TicketPriority,
  TicketStatus,
} from "@/types/service";
import type { Device } from "@/types/device";
import { SNAPSHOT_MS } from "@/lib/utils/format";
import { mockBuildings } from "./buildings";
import { mockDevices } from "./devices";
import { createRandom, isoOffset, roundTo } from "./random";

const rng = createRandom(4870);

export const mockTechnicians: Technician[] = [
  { id: "tech-01", name: "Andi Prasetyo", area: "Tangerang & Tangsel", cities: ["Tangerang", "Tangerang Selatan"], phone: "0812-8841-2207" },
  { id: "tech-02", name: "Rizky Maulana", area: "Jakarta Selatan & Pusat", cities: ["Jakarta Selatan", "Jakarta Pusat"], phone: "0813-1977-4520" },
  { id: "tech-03", name: "Dedi Kurniawan", area: "Bekasi & Cikarang", cities: ["Bekasi"], phone: "0821-2290-6614" },
  { id: "tech-04", name: "Yohanes Sitorus", area: "Jakarta Utara, Barat & Timur", cities: ["Jakarta Utara", "Jakarta Barat", "Jakarta Timur"], phone: "0812-9035-1182" },
  { id: "tech-05", name: "Fajar Nugroho", area: "Depok & Bogor", cities: ["Depok", "Bogor"], phone: "0857-7702-3349" },
  { id: "tech-06", name: "Agus Setiawan", area: "Bandung Raya", cities: ["Bandung", "Cimahi"], phone: "0822-1840-7751" },
];

interface CauseProfile {
  cause: TicketCause;
  total: number;
  visits: number;
  priority: TicketPriority[];
  problems: string[];
  material: [number, number];
}

const PROFILES: CauseProfile[] = [
  {
    cause: "cleaning",
    total: 8,
    visits: 8,
    priority: ["medium", "medium", "high"],
    problems: [
      "Endapan air terdeteksi di dasar tangki",
      "Probe level tertutup lumpur BBM",
      "Filter hisap sensor kadar air tersumbat",
    ],
    material: [200_000, 800_000],
  },
  {
    cause: "sensor_error",
    total: 11,
    visits: 6,
    priority: ["medium", "high", "high"],
    problems: [
      "Pembacaan level tidak berubah lebih dari 24 jam",
      "Sensor kadar air membaca nilai negatif",
      "Selisih level dengan ukur manual di atas 8%",
      "Suhu tangki melonjak tidak wajar",
    ],
    material: [500_000, 1_900_000],
  },
  {
    cause: "overheat",
    total: 4,
    visits: 3,
    priority: ["high", "critical"],
    problems: [
      "Suhu enclosure perangkat mencapai 71°C",
      "Kipas enclosure mati di ruang genset tanpa ventilasi",
    ],
    material: [300_000, 1_200_000],
  },
  {
    cause: "preventive",
    total: 9,
    visits: 9,
    priority: ["low", "low", "medium"],
    problems: [
      "Inspeksi berkala triwulan",
      "Penggantian baterai cadangan terjadwal",
      "Pemeriksaan seal dan kabel probe",
    ],
    material: [100_000, 450_000],
  },
  {
    cause: "power_loss",
    total: 8,
    visits: 3,
    priority: ["high", "critical", "high"],
    problems: [
      "Unit mati setelah pemadaman panel",
      "Adaptor daya rusak",
      "Baterai cadangan habis saat PLN padam",
    ],
    material: [350_000, 1_500_000],
  },
  {
    cause: "connectivity",
    total: 8,
    visits: 2,
    priority: ["low", "medium", "medium"],
    problems: [
      "Sinyal lemah, data terputus-putus",
      "Kuota SIM data habis",
      "Antena eksternal lepas",
    ],
    material: [50_000, 300_000],
  },
];

const buildingById = new Map(mockBuildings.map((b) => [b.id, b]));

function technicianFor(device: Device): string {
  const building = device.buildingId ? buildingById.get(device.buildingId) : null;
  const match = building ? mockTechnicians.find((t) => t.cities.includes(building.city)) : undefined;
  return match?.id ?? "tech-01";
}

function transportCost(device: Device): number {
  const building = device.buildingId ? buildingById.get(device.buildingId) : null;
  const far = building?.city === "Bandung" || building?.city === "Cimahi";
  return roundTo(far ? rng.float(480_000, 650_000) : rng.float(150_000, 360_000), 10_000);
}

function buildTickets(): ServiceTicket[] {
  const candidates = mockDevices.filter(
    (d) => d.lifecycle === "installed" || d.lifecycle === "repair"
  );
  const problemUnits = rng.shuffle(
    candidates.filter((d) => d.connectivity !== "online" && d.id !== "GM-014")
  );
  const healthyUnits = rng.shuffle(candidates.filter((d) => d.connectivity === "online"));
  let problemIndex = 0;
  let healthyIndex = 0;

  const drafts: Omit<ServiceTicket, "id" | "status">[] = [];

  for (const profile of PROFILES) {
    for (let i = 0; i < profile.total; i++) {
      const requiresVisit = i < profile.visits;
      const useProblemUnit =
        profile.cause !== "preventive" && rng.next() < 0.45 && problemIndex < problemUnits.length;
      const device = useProblemUnit
        ? problemUnits[problemIndex++]
        : healthyUnits[healthyIndex++];

      const hoursAgo = rng.float(6, 86 * 24);
      drafts.push({
        deviceId: device.id,
        buildingId: device.buildingId as string,
        createdAt: isoOffset(SNAPSHOT_MS, hoursAgo),
        visitDate: null,
        problem: rng.pick(profile.problems),
        cause: profile.cause,
        priority: rng.pick(profile.priority),
        technicianId: technicianFor(device),
        requiresVisit,
        cost: requiresVisit
          ? {
              transport: transportCost(device),
              technician: roundTo(rng.float(320_000, 760_000), 10_000),
              material: roundTo(rng.float(profile.material[0], profile.material[1]), 10_000),
            }
          : { transport: 0, technician: 0, material: 0 },
      });
    }
  }

  // Tiket GM-014 baru dibuat 2,5 jam lalu dan belum ditugaskan.
  const gm014 = mockDevices.find((d) => d.id === "GM-014") as Device;
  drafts.push({
    deviceId: gm014.id,
    buildingId: gm014.buildingId as string,
    createdAt: isoOffset(SNAPSHOT_MS, 2.5),
    visitDate: null,
    problem: "Unit berhenti mengirim data sejak 05.00, dugaan adaptor daya",
    cause: "power_loss",
    priority: "high",
    technicianId: null,
    requiresVisit: true,
    cost: { transport: 180_000, technician: 450_000, material: 0 },
  });
  // Ganti satu tiket konektivitas remote agar total tetap 48.
  const dropIndex = drafts.findIndex((d) => d.cause === "connectivity" && !d.requiresVisit);
  drafts.splice(dropIndex, 1);

  drafts.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  const statusPlan: TicketStatus[] = [
    ...Array<TicketStatus>(6).fill("open"),
    ...Array<TicketStatus>(8).fill("in_progress"),
  ];

  return drafts.map((draft, index) => {
    const status: TicketStatus = statusPlan[index] ?? "completed";
    const created = Date.parse(draft.createdAt);
    let visitDate: string | null = null;
    let technicianId = draft.technicianId;

    if (status === "open") {
      technicianId = index % 2 === 0 ? null : technicianId;
      if (draft.deviceId === "GM-014") technicianId = null;
      if (draft.requiresVisit && technicianId) {
        visitDate = new Date(SNAPSHOT_MS + rng.int(1, 3) * 86_400_000).toISOString();
      }
    } else if (draft.requiresVisit) {
      visitDate = new Date(
        Math.min(created + rng.float(4, 52) * 3_600_000, SNAPSHOT_MS - 3_600_000)
      ).toISOString();
    }

    const month = new Date(created + 7 * 3_600_000).getUTCMonth() + 1;
    return {
      ...draft,
      id: `SRV-26${String(month).padStart(2, "0")}-${String(48 - index + 100).padStart(4, "0")}`,
      status,
      technicianId,
      visitDate,
    };
  });
}

export const mockTickets: ServiceTicket[] = buildTickets();
