export type MainCategory = 'housing' | 'infrastructure' | 'education' | 'policing';

export interface KPICard {
  title: string;
  value: string;
  unit?: string;
  subtitlePrimary: string;
  subtitleSecondary?: string;
  badgeColor?: 'emerald' | 'amber' | 'rose' | 'slate';
}

export interface ScatterPoint {
  borough: string;
  yPrice: number;
  xGrowthPct: number;
  isFocusBorough?: boolean;
}

export interface LinePoint {
  quarter: string;
  boroughValue: number;
  comparisonValue?: number;
  londonAverage?: number;
}

export interface BarRankingItem {
  rank: number;
  label: string;
  value: number;
  isFocusBorough?: boolean;
}

export interface StackedBarItem {
  category: string;
  stateFunded: number;
  independent: number;
}

export interface InfrastructureProject {
  title: string;
  description: string;
  status: 'Approved' | 'In Review' | 'Proposed';
}

export interface BoroughDashboardData {
  boroughName: string;
  lastUpdated: string;
  kpiCards: Record<MainCategory, KPICard[]>;

  housing: {
    priceGrowthScatter: ScatterPoint[];
    historicalGrowth: LinePoint[];
    stockRanking: BarRankingItem[];
    affordableHousing: Array<{ year: string; starts: number; completions: number }>;
    highlights: Record<string, string>;
  };

  infrastructure: {
    projects: InfrastructureProject[];
  };

  education: {
    gcseTrend: LinePoint[];
    ofstedRanking: BarRankingItem[];
    schoolAvailability: StackedBarItem[];
  };

  policing: {
    crimeTrend: LinePoint[];
    rankingChanges: Array<{ borough: string; year2024Rank: number; year2026Rank: number; isFocusBorough?: boolean }>;
    summaryText: string;
  };
}
