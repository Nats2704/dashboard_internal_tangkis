/**
 * Waktu snapshot data mock. Semua "x jam lalu" dihitung terhadap waktu ini
 * supaya render server dan client identik. Saat API tersedia, ganti dengan
 * timestamp sinkronisasi terakhir dari backend.
 */
export const DATA_SNAPSHOT_AT = "2026-09-26T08:00:00+07:00";

export const LATEST_FIRMWARE = "v2.4.1";

/** Unit dianggap offline jika tidak mengirim data lebih dari ambang ini. */
export const OFFLINE_THRESHOLD_HOURS = 2;
export const REPORT_INTERVAL_MINUTES = 15;

export const WEAK_SIGNAL_DBM = -90;
export const LOW_BATTERY_PCT = 40;

/** Selisih terhadap hasil lab di atas ambang ini menandai sensor perlu kalibrasi. */
export const CALIBRATION_THRESHOLD_PCT = 5;

export const WARRANTY_ALERT_DAYS = 60;

/** Asumsi biaya layanan di model Excel, per unit per tahun. */
export const COST_ASSUMPTION_PER_UNIT_YEAR = 1_900_000;
/** Selisih di atas ambang ini dianggap menyimpang dari asumsi. */
export const VARIANCE_DEVIATION_PCT = 10;
export const VARIANCE_WARNING_PCT = 20;

export const WAREHOUSE_LOCATION = "Gudang TANGKIS Serpong";
export const WORKSHOP_LOCATION = "Workshop Cikupa";

export const SERVICE_PERIOD_LABEL = "Kuartal III 2026 (1 Jul – 26 Sep)";
