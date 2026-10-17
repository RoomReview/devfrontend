export interface PostcodeRow {
  postcodeId: string;
  code: string;
  outcode: string;
  incode: string;
  latitude: number | null;
  longitude: number | null;
  imageUrl?: string | null;
  image_url?: string | null;
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

export interface CrimeRateContext {
  boroughName: string;
  year: number;
  population: number;
  annualisedCrimes: number;
  ratePer1000: number;
  londonAveragePer1000: number | null;
}

export interface PostcodeApiResponse {
  postcode: PostcodeRow;
  lsoaMap: {
    filename: string;
    mapVersion: string;
    imageUrl: string | null;
    imageWidthPx: number;
    imageHeightPx: number;
    minLon: number;
    maxLon: number;
    minLat: number;
    maxLat: number;
  } | null;
  borough: BoroughSummary | null;
  crimeRateContext?: CrimeRateContext | null;
  crimeData: unknown[];
  demography: unknown[];
  propertyValueData: unknown[];
  rentData: Array<{ rent: number; type: string }>;
  votingData: unknown[];
  educationData: unknown[];
  housingStockData: unknown[];
  districtData: unknown[];
}
