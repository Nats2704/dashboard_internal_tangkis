import type { Sensor, SensorKind, SensorStatus } from "@/types/sensor";
import { SENSOR_KIND, SENSOR_STATUS } from "@/lib/constants/status";
import { formatPercent } from "@/lib/utils/format";
import { SegmentBar } from "@/components/ui/Meter";
import { SubHeading } from "@/components/ui/Panel";

const KINDS: SensorKind[] = ["level", "water", "temperature"];
const STATUSES: SensorStatus[] = ["normal", "calibration", "stuck", "out_of_range", "no_data"];
const SEGMENT_CLASS: Record<SensorStatus, string> = {
  normal: "bg-success/70",
  calibration: "bg-warning",
  stuck: "bg-danger",
  out_of_range: "bg-danger/60",
  no_data: "bg-line-strong",
};

/** Kesehatan sensor dipecah per jenis: level BBM, kadar air, dan suhu tangki. */
export function SensorKindBreakdown({ sensors }: { sensors: Sensor[] }) {
  return (
    <div>
      <SubHeading>Per jenis sensor</SubHeading>
      <ul className="space-y-5">
        {KINDS.map((kind) => {
          const list = sensors.filter((s) => s.kind === kind);
          const count = (status: SensorStatus) => list.filter((s) => s.status === status).length;
          const evaluated = list.length - count("no_data");
          const normalPct = evaluated ? (count("normal") / evaluated) * 100 : 0;
          const issues = STATUSES.filter((s) => s !== "normal" && s !== "no_data" && count(s) > 0);
          return (
            <li key={kind}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[13px] text-ink-2">{SENSOR_KIND[kind].label}</p>
                <p className="tabular text-[15px] font-semibold text-ink">
                  {formatPercent(normalPct)}
                  <span className="ml-1 text-[11px] font-normal text-muted">normal</span>
                </p>
              </div>
              <SegmentBar
                className="mt-2"
                label={`${SENSOR_KIND[kind].label}: ${STATUSES.map((s) => `${SENSOR_STATUS[s].label} ${count(s)}`).join(", ")}`}
                segments={STATUSES.map((s) => ({
                  key: s,
                  label: SENSOR_STATUS[s].label,
                  value: count(s),
                  className: SEGMENT_CLASS[s],
                }))}
              />
              <p className="mt-1.5 text-[11.5px] text-muted">
                {issues.length
                  ? issues.map((s) => `${count(s)} ${SENSOR_STATUS[s].label.toLowerCase()}`).join(" · ")
                  : "Tidak ada anomali"}
                {count("no_data") ? <span className="text-subtle"> · {count("no_data")} tanpa data</span> : null}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
