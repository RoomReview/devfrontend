export interface BoroughDatasetItem {
  label: string;
  value: number;
  crime_rate?: number;
  comparisonValue?: number;
}

export interface BoroughDistrictItem {
  districtCode: string;
  boroughName: string;
}

export interface BoroughCrimeTrendItem {
  year: number;
  totalCrimesPer1000: number;
  londonAveragePer1000: number | null;
}

export interface BoroughPriceComparisonItem {
  boroughName: string;
  averagePrice: number;
  yoyGrowthPct: number;
  period: string;
  growthHistory?: Array<{ period: string; value: number }>;
}

export interface BoroughHousingStockComparisonItem {
  boroughName: string;
  year: number;
  totalDwellings: number;
  netAdditions: number;
  affordableStarts: number;
  affordableCompletions: number;
  bandD: number;
  bandDRank: number | null;
  affordableFinancialYear?: string | null;
  totalDwellingsRank: number | null;
  netAdditionsRank: number | null;
}

export interface BoroughEducationComparisonItem {
  boroughName: string;
  totalSchools: number;
  educationRank: number;
  gcseAttainment8: number;
  ks2ExpectedStandard: number;
  ofstedGoodAndOutstanding: number;
}

export interface BoroughPoliceComparisonItem {
  boroughName: string;
  year: number;
  totalCrimesPer1000: number;
  totalCrimesAnnualised?: number | null;
  safetyRank: number | null;
}

export interface BoroughCrimeHighlight {
  year: number;
  totalCrimesPer1000: number;
  rank: number | null;
  yoyChangePct: number | null;
  lowestGapCategory: string | null;
  lowestGapPct: number | null;
  largestIncreaseCategory: string | null;
  largestIncreasePct: number | null;
}

export interface BoroughApiResponse {
  boroughId: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  officialWebsite?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  metrics?: Record<string, unknown>;
  educationData: BoroughDatasetItem[];
  housingStockData: BoroughDatasetItem[];
  districtData: BoroughDistrictItem[];
  rentData: { rent: number; type: string }[];
  rentTrendData?: { year: number; quarter: number; value: number }[];
  propertyValueData: BoroughDatasetItem[];
  priceTrendData?: { year: number; quarter: number; value: number }[];
  crimeData: BoroughDatasetItem[];
  crimeTrendData?: BoroughCrimeTrendItem[];
  housingPriceComparisonData?: BoroughPriceComparisonItem[];
  housingStockComparisonData?: BoroughHousingStockComparisonItem[];
  housingStockHistory?: BoroughHousingStockComparisonItem[];
  educationComparisonData?: BoroughEducationComparisonItem[];
  policingComparisonData?: BoroughPoliceComparisonItem[];
  crimeHighlight?: BoroughCrimeHighlight | null;
}
