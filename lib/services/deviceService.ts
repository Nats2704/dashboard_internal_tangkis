import type { Device } from "@/types/device";
import { mockDevices } from "@/lib/mock-data/devices";
import { load } from "./source";

export function getDevices(): Promise<Device[]> {
  return load("/devices", () => mockDevices);
}
