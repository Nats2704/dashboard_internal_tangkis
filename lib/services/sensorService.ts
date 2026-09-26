import type { Sensor, SensorTrendPoint } from "@/types/sensor";
import { mockSensors, mockSensorTrend } from "@/lib/mock-data/sensors";
import { load } from "./source";

export function getSensors(): Promise<Sensor[]> {
  return load("/sensors", () => mockSensors);
}

export function getSensorTrend(): Promise<SensorTrendPoint[]> {
  return load("/sensors/trend?weeks=12", () => mockSensorTrend);
}
