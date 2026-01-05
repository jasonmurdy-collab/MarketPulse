
export enum Region {
  Kingston = "Kingston",
  PrinceEdwardCounty = "Prince Edward County",
  Frontenac = "Frontenac",
  Belleville = "Belleville",
  Hastings = "Hastings",
  Brockville = "Brockville",
  Napanee = "Napanee",
  SmithsFalls = "Smiths Falls"
}

export type ViewMode = 'Weekly' | 'Monthly';

export interface WeeklyStats {
  id: string;
  weekRange: string; // e.g., "Nov 24 - Dec 1"
  weekEndDate: string; // ISO format for sorting: "2024-12-01"
  region: Region;
  avgPrice: number | null;
  medPrice: number | null;
  salesVolume: number | null;
  activeListings: number | null; 
  moi: number | null; // Months of Inventory
  soldListRatio: number | null; // Percentage (e.g., 98.5)
  aboveListPricePct?: number | null; // Optional
}

export interface MonthlyStats {
  id: string;
  year: number;
  month: string; // e.g., "January"
  date: string; // ISO format for sorting: "2024-01-01"
  region: Region;
  avgPrice: number | null;
  medPrice: number | null;
  salesVolume: number | null;
  activeListings: number | null;
  moi: number | null;
  soldListRatio: number | null;
}

export type MetricType = 'avgPrice' | 'salesVolume' | 'moi' | 'soldListRatio';

export const METRIC_LABELS: Record<MetricType, string> = {
  avgPrice: "Avg Price",
  salesVolume: "Sales Vol",
  moi: "Inventory (MOI)",
  soldListRatio: "SP/LP %"
};

export const REGION_COLORS: Record<Region, string> = {
  [Region.Kingston]: "#3b82f6", // Blue
  [Region.PrinceEdwardCounty]: "#8b5cf6", // Purple
  [Region.Frontenac]: "#10b981", // Emerald
  [Region.Belleville]: "#f59e0b", // Amber
  [Region.Hastings]: "#ef4444", // Red
  [Region.Brockville]: "#06b6d4", // Cyan
  [Region.Napanee]: "#db2777", // Pink
  [Region.SmithsFalls]: "#84cc16", // Lime
};
