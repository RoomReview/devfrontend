export interface PropertyDetails {
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  floorAreaSqFt: number;
  epcRating: string;
  councilTaxBand: string;
}

export interface IndicativeMarketRange {
  indicativePrice: number;
  lowerRange: number;
  upperRange: number;
  disclaimer: string;
}

export interface ComparableSale {
  id: string;
  address: string;
  type: string;
  beds: number;
  price: number;
  date: string;
}

export interface PriceHistoryPoint {
  year: string;
  priceThousands: number;
}

export interface ChartBarData {
  category: string;
  value: number;
}

export interface PieChartItem {
  name: string;
  percentage: number;
  color?: string;
}

export interface CategoryScoreItem {
  category: string;
  score: number; // 0 to 100
}

export interface NearbyPostcodeScore {
  postcode: string;
  score: number;
}

export interface PostcodeRankingRow {
  rank: number;
  postcode: string;
  score: number;
  distanceMi: number;
  vsTargetScore: string;
  isTargetProperty?: boolean;
}

export interface StationInfo {
  name: string;
  distanceMi: number;
  walkTimeMins: number;
  lines: string[];
}

export interface KeyDestinationTime {
  destination: string;
  durationMins: number;
}

export interface SchoolInfo {
  name: string;
  rating: 'Outstanding' | 'Good' | 'Requires Improvement' | 'Inadequate';
  type: string;
  distanceMi: number;
}

export interface ParkInfo {
  name: string;
  acres: number;
  distanceMi: number;
}

export interface AmenityDistanceItem {
  label: string;
  value: string;
}

export interface RadarMetric {
  subject: string;
  score: number;
  fullMark: number;
}

export interface KeyValuePoint {
  title: string;
  description: string;
}

export interface AudienceCard {
  title: string;
  description: string;
}

export interface DataSourceCard {
  id: string;
  iconName: string;
  title: string;
  description: string;
  sourceUrl?: string;
}

export interface BuyerInsightReportData {
  meta: {
    reportTitle: string;
    postcode: string;
    areaName: string;
    overallScore: number;
    safetyScore: number;
    affordabilityTag: string;
    livabilityScore: number;
    generatedDateText: string;
    versionText?: string;
  };
  summaryOfFindings: {
    overallAssessmentTitle: string;
    overallAssessmentSubtitle: string;
    narrativeSummary: string;
    strengths: KeyValuePoint[];
    considerations: KeyValuePoint[];
    mayAppealTo: AudienceCard[];
  };
  executiveSummary: {
    maySuitText: string;
    lifestyleSignals: string[];
    keyConsiderations: string[];
    overallAreaProfileText: string;
  };
  propertyContext: {
    details: PropertyDetails;
    marketRange: IndicativeMarketRange;
    comparableSales: ComparableSale[];
  };
  priceTrends: {
    fiveYearGrowthPercent: number;
    annualGrowthPercent: number;
    vsBoroughAvgPercent: number;
    priceHistory: PriceHistoryPoint[];
    marketAnalysisParagraphs: string[];
    disclaimerText: string;
  };
  rentalContext: {
    avgRentPcm: number;
    demandLevel: string;
    avgTimeToLetDays: number;
    grossRentalYieldPercent: number;
    grossYieldSubtitle: string;
    boroughAvgYieldPercent: number;
    boroughYieldSubtitle: string;
    tenantProfile: Array<{ category: string; percent: number }>;
    marketConditions: string[];
    contextParagraphs: string[];
    disclaimerText: string;
  };
  crimeAndSafety: {
    safetyScore: number;
    crimeRateTrendPercent: number;
    vsBoroughPercent: number;
    crimeCategories: ChartBarData[];
    keyHighlights: string[];
    nearbyPostcodeComparisons: NearbyPostcodeScore[];
    sourceAttribution: string;
  };
  communityProfile: {
    disclaimerNotice: string;
    populationDensityPerKm2: number;
    employmentRatePercent: number;
    medianAge: number;
    ageDistribution: PieChartItem[];
    householdComposition: PieChartItem[];
    employmentSectors: Array<{ sector: string; percent: number }>;
    educationLevels: Array<{ level: string; percent: number }>;
    sourceAttribution: string;
  };
  transportAndConnectivity: {
    connectivityScore: number;
    nearestStationMi: number;
    zone: string | number;
    nearbyStations: StationInfo[];
    travelTimes: KeyDestinationTime[];
    busRoutesInfo: string[];
    cyclingAndRoadsInfo: string[];
    sourceAttribution: string;
  };
  localServices: {
    schools: SchoolInfo[];
    parks: ParkInfo[];
    shoppingAndDining: AmenityDistanceItem[];
    healthcareAndLeisure: AmenityDistanceItem[];
    amenityOverviewParagraphs: string[];
  };
  planningAndAreaChange: {
    disclaimerNotice: string;
    planningApplicationsLast12Months: number;
    approvalRatePercent: number;
    developmentDensity: string;
    housingGrowth: {
      boroughTargetText: string;
      protectionStatusText: string;
      overviewText: string;
    };
    regenerationOverview: Array<{ title: string; text: string }>;
    transportImprovements: Array<{ title: string; text: string }>;
    contextForBuyersText: string;
  };
  scoreBreakdown: {
    overallScore: number;
    radarData: RadarMetric[];
    categoryScores: CategoryScoreItem[];
    weightings: Array<{ category: string; weightPercent: number }>;
    methodologyNotes: string[];
  };
  postcodeComparison: {
    disclaimerNotice: string;
    chartScores: Array<{ postcode: string; score: number }>;
    rankingTable: PostcodeRankingRow[];
    analysisPositionText: string;
    keyObservations: string[];
  };
  bottomLineText: string;
  dataSources: {
    introText: string;
    disclaimerText: string;
    sources: DataSourceCard[];
  };
  dataAndLicensing: {
    introText: string;
    openGovernmentLicenceText: string;
    providerLicencesText: string;
    trademarksText: string;
    endorsementText: string;
    accuracyText: string;
    methodologyLinkText?: string;
  };
}

export interface BuyerInsightReportProps {
  data: BuyerInsightReportData;
  onPrintReport?: () => void;
  onMethodologyClick?: () => void;
  onSourceClick?: (sourceId: string) => void;
}