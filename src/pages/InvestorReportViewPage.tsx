import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CompleteInvestorReport } from './InvestorReport';
import type { InvestorReportData } from '../types/investorReport';
import type { FullInvestorReportData } from './InvestorReport';

const toCompleteReportData = (data: InvestorReportData): FullInvestorReportData => ({
  reportDate: data.reportDate,
  pageCount: 1,
  overallScore: data.metrics.score,
  maxScore: data.metrics.maxScore,
  property: {
    address: data.property.address,
    postcode: data.property.postcode,
    borough: data.property.borough,
    type: data.property.propertyType,
    bedrooms: data.property.bedrooms,
    sizeSqFt: data.property.sizeSqFt,
    tenure: data.property.tenure,
    modelledEstimate: data.property.modelledEstimate,
    areaMedian: data.property.areaMedian,
    boroughMedian: data.property.boroughMedian,
  },
  metrics: {
    modelledYield: data.metrics.yieldPercent,
    fiveYearGrowth: data.metrics.historicalGrowthPercent,
    demandLevel: data.metrics.demandLevel,
    avgDaysToLet: data.metrics.avgDaysToLet,
    scenarioRange: 'No data available',
    relativeRisk: 'No data available',
  },
  keyDrivers: [],
  comparables: data.comparables,
  priceHistory: {
    tenYearGrowth: data.metrics.historicalGrowthPercent,
    cagr: data.metrics.historicalGrowthPercent,
    vsBorough: 0,
    priceStability: 0,
    points: data.priceTrajectory,
    insights: [],
  },
  rentalAnalysis: {
    grossYield: data.metrics.yieldPercent,
    monthlyRent: data.metrics.monthlyRent ?? 0,
    annualIncome: (data.metrics.monthlyRent ?? 0) * 12,
    timeToLetDays: data.metrics.avgDaysToLet,
    occupancyRate: 0,
    fiveYearRentGrowth: data.metrics.historicalGrowthPercent,
    tenantProfile: [],
    competitivePosition: [],
  },
  developmentPipeline: {
    applications1km: 0,
    approvalRate: 0,
    newUnitsPipeline: 0,
    projects: data.regenerationProjects.map((project) => ({
      name: project.project,
      units: project.units,
      status: project.status,
      distance: project.distance,
    })),
  },
  strategicPlanning: {
    housingTarget10Yr: 0,
    housingStockIncreasePct: 0,
    commercialTargets: [],
  },
  regenerationZones: [],
  transport: {
    connectivityScore: 0,
    features: [],
    stations: data.stations.map((station) => ({
      name: station.name,
      lines: station.lines,
      walkTime: station.walkTimeMins,
      destination: station.destinationSummary,
    })),
  },
  demographics: {
    popGrowth10Yr: 0,
    medianAge: 0,
    universityEducatedPct: 0,
    ageDistribution: [],
    employmentSectors: [],
    economicIndicators: [],
  },
  governance: {
    boroughControl: 'Data unavailable',
    controlSinceYear: 0,
    seatsRatio: 'Data unavailable',
    policyStability: 'Data unavailable',
  },
  scoreBreakdown: data.scoreBreakdown ?? [],
  postcodeRanks: data.postcodeRanks.map((item) => ({
    rank: item.rank,
    postcode: item.postcode,
    score: item.score,
    isCurrent: item.isCurrentProperty,
  })),
});

export const InvestorReportViewPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reportData = (location.state as { reportData?: InvestorReportData } | null)?.reportData;
  const handlePrintReport = () => window.print();

  if (!reportData) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-[#516078]">No investor report data available</p>
          <button
            onClick={() => navigate('/investor-report', { replace: true })}
            className="mt-4 rounded bg-[#8B0000] px-6 py-2 text-sm font-semibold text-white hover:bg-[#6f0000]"
          >
            Back to Investor Report
          </button>
        </div>
      </div>
    );
  }

  return <CompleteInvestorReport data={toCompleteReportData(reportData)} onPrintReport={handlePrintReport} />;
};
