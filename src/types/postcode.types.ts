export interface PostcodeRow {
  postcode_id: string;
  code: string;
  outcode: string;
  incode: string;
  latitude: number | null;
  longitude: number | null;
  metrics: Record<string, unknown>;
  boroughId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BoroughSummary {
  boroughId: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  metrics: Record<string, unknown>;
}

export interface PostcodeApiResponse {
  postcode: PostcodeRow;
  borough: BoroughSummary | null;
  crimeData: unknown[];
  demography: unknown[];
  propertyValueData: unknown[];
  rentData: unknown[];
  votingData: unknown[];
  educationData: unknown[];
  housingStockData: unknown[];
  districtData: unknown[];
}
