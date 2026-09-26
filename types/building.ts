export type BuildingCategory =
  | "office"
  | "datacenter"
  | "telco"
  | "hospital"
  | "industrial"
  | "education"
  | "retail"
  | "hotel"
  | "residential"
  | "laboratory";

export interface Customer {
  id: string;
  name: string;
}

export interface Building {
  id: string;
  /** Prefix kode unit, misalnya "GM" untuk GM-014. */
  code: string;
  name: string;
  customerId: string;
  city: string;
  area: string;
  lat: number;
  lng: number;
  category: BuildingCategory;
}
