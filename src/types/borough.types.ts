export interface BoroughDatasetItem {
  label: string;
  value: number;
  crime_rate?: number;
}

export interface BoroughDistrictItem {
  districtCode: string;
  boroughName: string;
}

export interface BoroughApiResponse {
  boroughId: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  metrics?: Record<string, unknown>;
  educationData: BoroughDatasetItem[];
  housingStockData: BoroughDatasetItem[];
  districtData: BoroughDistrictItem[];
  rentData: { rent: number; type: string }[];
  propertyValueData: BoroughDatasetItem[];
  crimeData: BoroughDatasetItem[];
}
