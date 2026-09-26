import type { LifecycleStage } from "./device";

export interface InventoryEvent {
  date: string;
  label: string;
}

export interface InventoryRecord {
  deviceId: string;
  stage: LifecycleStage;
  location: string;
  since: string;
  note: string;
  history: InventoryEvent[];
}

export interface InventoryFlow {
  from: LifecycleStage;
  to: LifecycleStage;
  count: number;
}

export interface InventorySummary {
  total: number;
  byStage: Record<LifecycleStage, number>;
  redeployable: number;
}
