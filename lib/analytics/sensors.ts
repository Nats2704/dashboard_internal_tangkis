import type { Sensor, SensorSummary } from "@/types/sensor";

export function summarizeSensors(sensors: Sensor[]): SensorSummary {
  const evaluated = sensors.filter((s) => s.status !== "no_data");
  const count = (status: Sensor["status"]) =>
    sensors.filter((s) => s.status === status).length;

  const withDeviation = evaluated.filter(
    (s) => s.deviationPct !== null && s.status !== "out_of_range"
  );
  const avgDeviation =
    withDeviation.reduce((sum, s) => sum + Math.abs(s.deviationPct ?? 0), 0) /
    Math.max(1, withDeviation.length);

  const normal = count("normal");
  const calibrationUnits = new Set(
    sensors.filter((s) => s.status === "calibration").map((s) => s.deviceId)
  );

  return {
    total: sensors.length,
    evaluated: evaluated.length,
    normal,
    normalPct: evaluated.length ? (normal / evaluated.length) * 100 : 0,
    stuck: count("stuck"),
    outOfRange: count("out_of_range"),
    calibration: count("calibration"),
    noData: count("no_data"),
    avgDeviationPct: avgDeviation,
    unitsNeedingCalibration: calibrationUnits.size,
  };
}

/** Anomali ditampilkan lebih dulu, lalu selisih terbesar. */
export function sensorSeverityRank(sensor: Sensor): number {
  const order: Record<Sensor["status"], number> = {
    stuck: 0,
    out_of_range: 1,
    calibration: 2,
    no_data: 3,
    normal: 4,
  };
  return order[sensor.status];
}
