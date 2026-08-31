export interface PropertyDetails {
  address: string;
  postcode: string;
  borough: string;
  propertyType: string;
  bedrooms: number;
  sizeSqFt: number;
  tenure: string;
  modelledEstimate: number;
  areaMedian: number;
  boroughMedian: number;
}

export interface MetricCardData {
  score: number;
  maxScore: number;
  yieldPercent: number;
  monthlyRent?: number;
  historicalGrowthPercent: number;
  demandLevel: string;
  avgDaysToLet: number;
}

export interface ComparableSale {
  address: string;
  type: string;
  pricePaid: number;
  date: string;
}

export interface ChartDataPoint {
  year: number;
  price: number;
}

export interface RegenerationProject {
  project: string;
  units: number;
  status: 'Construction' | 'Approved' | 'Planning';
  distance: string;
}

export interface StationAccess {
  name: string;
  lines: string;
  walkTimeMins: number;
  destinationSummary: string;
}

export interface PostcodeRank {
  rank: number;
  postcode: string;
  score: number;
  isCurrentProperty?: boolean;
}

export interface InvestorReportData {
  reportDate: string;
  property: PropertyDetails;
  metrics: MetricCardData;
  comparables: ComparableSale[];
  priceTrajectory: ChartDataPoint[];
  regenerationProjects: RegenerationProject[];
  stations: StationAccess[];
  postcodeRanks: PostcodeRank[];
  scoreBreakdown?: Array<{ category: string; weight: number; score: number }>;
}