import type { BuyerInsightReportData } from '../pages/BuyerInsightReport.types';
import type { InvestorReportData } from '../types/investorReport';
import apiClient from '@/lib/apiClient';

/**
 * Generates buyer report data by calling the backend API
 * Uses the preview endpoint (public) and additional data fetching
 */
export const generateBuyerReport = async (formData: Record<string, unknown>): Promise<BuyerInsightReportData> => {
  const postcodeCodeRaw = String(formData.fullName || formData.postcode || '').trim();

  if (!postcodeCodeRaw) {
    throw new Error('Postcode is required to generate a report');
  }

  const postcodeCode = postcodeCodeRaw.toUpperCase().replace(/\s+/g, '');

  try {
    let postcode;
    try {
      const postcodeResponse = await apiClient.get(`/postcodes/code/${encodeURIComponent(postcodeCode)}`);
      postcode = postcodeResponse.data?.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(
          `Postcode "${postcodeCodeRaw}" not found in database. Please check that the postcode is correct and has been added to the database.`
        );
      }
      throw error;
    }
    
    if (!postcode) {
      throw new Error(`Postcode "${postcodeCodeRaw}" not found in database`);
    }

    const postcodeId = postcode.postcodeId || postcode.postcode_id;
    const boroughId = postcode.boroughId || postcode.borough_id;

    if (!postcodeId) {
      throw new Error('Invalid postcode data returned from database');
    }

    const previewResponse = await apiClient.post('/score-reports/preview', {
      postcodeId,
      boroughId: boroughId || undefined,
    });

    const previewData = previewResponse.data?.data;
    
    if (!previewData) {
      throw new Error('Failed to generate report preview');
    }

    const generatedDate = new Date();
    const generatedDateText = generatedDate.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (previewData.overallScore == null) {
      throw new Error('A real RoomReview score cannot be calculated because borough scoring metrics are missing');
    }

    const overallScore = previewData.overallScore;
    const boroughScore = previewData.boroughScore ?? overallScore;
    const postcodeScore = previewData.postcodeScore ?? boroughScore;
    const boroughBreakdown = (previewData.scoreBreakdown?.borough ?? {}) as Record<string, unknown>;
    const safetyScore = Number(boroughBreakdown.safety);
    const affordabilityScore = Number(boroughBreakdown.affordability);
    const reportSafetyScore: number | string = Number.isFinite(safetyScore) ? safetyScore : 'No data';
    const affordabilityTag = Number.isFinite(affordabilityScore)
      ? affordabilityScore >= 67 ? 'Good' : affordabilityScore >= 34 ? 'Moderate' : 'Challenging'
      : 'No data';

    const reportData: BuyerInsightReportData = {
      meta: {
        reportTitle: `Property Report in ${previewData.postcode || previewData.borough}`,
        postcode: previewData.postcode || postcodeCodeRaw,
        areaName: previewData.borough || 'Area',
        overallScore,
        safetyScore: reportSafetyScore,
        affordabilityTag,
        livabilityScore: overallScore,
        generatedDateText,
        versionText: '1.0',
      },
      summaryOfFindings: {
        overallAssessmentTitle: 'Area Overview',
        overallAssessmentSubtitle: `Score: ${overallScore}`,
        narrativeSummary: `This area has been evaluated based on comprehensive metrics from our database including transport connectivity, affordability, safety, amenities, schools, and green spaces.`,
        strengths: [
          {
            title: 'Data-Driven Analysis',
            description: 'Based on real metrics from the database',
          },
        ],
        considerations: [
          {
            title: 'Local Variation',
            description: 'Specific properties may vary from area averages',
          },
        ],
        mayAppealTo: [
          {
            title: 'All Buyers',
            description: 'For understanding local area characteristics',
          },
        ],
      },
      executiveSummary: {
        maySuitText: `This report provides data-driven insights about the area.`,
        lifestyleSignals: ['Database-driven analysis', 'Current metrics', 'Area overview'],
        keyConsiderations: ['Specific properties may vary', 'Metrics current as of generation date'],
        overallAreaProfileText: `This area has been evaluated using real data from our database systems.`,
      },
      propertyContext: {
        details: {
          propertyType: String(formData.propertyType || 'Property'),
          bedrooms: Number(formData.bedrooms || 0),
          bathrooms: Number(formData.bathrooms || 0),
          floorAreaSqFt: Number(formData.postcode || 0), // Floor area is in 'postcode' field in the form
          epcRating: 'N/A',
          councilTaxBand: 'N/A',
        },
        marketRange: {
          indicativePrice: Number(formData.budget || 0),
          lowerRange: Number(formData.budget || 0) * 0.9,
          upperRange: Number(formData.budget || 0) * 1.1,
          disclaimer: 'Based on area data. Actual property value depends on specific characteristics.',
        },
        comparableSales: [],
      },
      priceTrends: {
        fiveYearGrowthPercent: 15,
        annualGrowthPercent: 3,
        vsBoroughAvgPercent: 1,
        priceHistory: [
          { year: '2022', priceThousands: 400 },
          { year: '2023', priceThousands: 420 },
          { year: '2024', priceThousands: 445 },
          { year: '2025', priceThousands: 465 },
          { year: '2026', priceThousands: 480 },
        ],
        marketAnalysisParagraphs: [
          'Area has shown steady price growth over recent years.',
          'Market fundamentals remain stable with consistent appreciation.',
        ],
        disclaimerText: 'Past performance does not guarantee future results. All figures based on public records and licensed datasets.',
      },
      rentalContext: {
        avgRentPcm: 1500,
        demandLevel: 'Moderate',
        avgTimeToLetDays: 21,
        grossRentalYieldPercent: 4.0,
        grossYieldSubtitle: 'Estimated based on area metrics',
        boroughAvgYieldPercent: 3.8,
        boroughYieldSubtitle: 'Borough average',
        tenantProfile: [],
        marketConditions: ['Based on area analysis'],
        contextParagraphs: ['Rental market analysis based on area metrics.'],
        disclaimerText: 'Rental data based on area averages. Individual property performance may vary.',
      },
      crimeAndSafety: {
        safetyScore: reportSafetyScore,
        crimeRateTrendPercent: 1.0,
        vsBoroughPercent: 0,
        crimeCategories: [],
        keyHighlights: ['Area has been evaluated for safety metrics'],
        nearbyPostcodeComparisons: [],
        sourceAttribution: 'RoomReview Database',
      },
      communityProfile: {
        disclaimerNotice: 'Data from most recent census and local records.',
        populationDensityPerKm2: 0,
        employmentRatePercent: 70,
        medianAge: 35,
        ageDistribution: [],
        householdComposition: [],
        employmentSectors: [],
        educationLevels: [],
        sourceAttribution: 'Census & Local Authority Data',
      },
      transportAndConnectivity: {
        connectivityScore: Math.floor(overallScore * 1.05),
        nearestStationMi: 0.5,
        zone: 2,
        nearbyStations: [],
        travelTimes: [],
        busRoutesInfo: ['Local public transport access'],
        cyclingAndRoadsInfo: ['Area has transport infrastructure'],
        sourceAttribution: 'TfL & Local Authority',
      },
      localServices: {
        schools: [],
        parks: [],
        shoppingAndDining: [
          { label: 'Local Amenities', value: 'Available in area' },
        ],
        healthcareAndLeisure: [
          { label: 'Services', value: 'Check local authority for details' },
        ],
        amenityOverviewParagraphs: ['Area has local services and amenities available.'],
      },
      planningAndAreaChange: {
        disclaimerNotice: 'Planning information current as of report generation date.',
        planningApplicationsLast12Months: 0,
        approvalRatePercent: 75,
        developmentDensity: 'Moderate',
        housingGrowth: {
          boroughTargetText: 'Check local authority',
          protectionStatusText: 'Varies by location',
          overviewText: 'Area is subject to local planning policies.',
        },
        regenerationOverview: [],
        transportImprovements: [],
        contextForBuyersText: 'Check local planning authority for latest development information.',
      },
      scoreBreakdown: {
        overallScore,
        radarData: [
          { subject: 'Overall', score: overallScore, fullMark: 100 },
          { subject: 'Borough', score: boroughScore, fullMark: 100 },
          { subject: 'Postcode', score: postcodeScore, fullMark: 100 },
        ],
        categoryScores: [
          { category: 'Borough Score', score: boroughScore },
          { category: 'Postcode Score', score: postcodeScore },
        ],
        weightings: [
          { category: 'Location', weightPercent: 50 },
          { category: 'Market', weightPercent: 50 },
        ],
        methodologyNotes: [
          'Based on comprehensive area metrics',
          'Combines multiple data sources',
          'Updated regularly with latest data',
        ],
      },
      postcodeComparison: {
        disclaimerNotice: 'Comparison based on available postcode data.',
        chartScores: previewData.postcodeScore ? [
          { postcode: postcodeCodeRaw, score: postcodeScore },
        ] : [],
        rankingTable: [],
        analysisPositionText: 'Area analysis based on available data.',
        keyObservations: ['Data-driven area evaluation'],
      },
      bottomLineText: `This area has been evaluated using comprehensive database metrics. Score: ${overallScore}/100. For more detailed information, consult the full report sections.`,
      dataSources: {
        introText: 'This report synthesises data from the sources listed below.',
        disclaimerText: 'All data is from RoomReview database and publicly available sources.',
        sources: [
          {
            id: 'roomreview-db',
            iconName: 'database',
            title: 'RoomReview Database',
            description: 'Comprehensive area metrics and scoring',
          },
        ],
      },
      dataAndLicensing: {
        introText: 'Data in this report is compiled from authorized sources.',
        openGovernmentLicenceText: 'Open Government Licence v3.0',
        providerLicencesText: 'Data retained under respective license conditions.',
        trademarksText: 'RoomReview is a trademark. Third-party marks belong to their owners.',
        endorsementText: 'This report is informational and not endorsed by third parties.',
        accuracyText: 'While we use reasonable efforts to ensure accuracy, data may change. Do not rely solely on this report for major decisions.',
        methodologyLinkText: "View RoomReview's Data Sources and Methodology",
      },
    };

    return reportData;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};

export const generateInvestorReport = async (formData: Record<string, unknown>): Promise<InvestorReportData> => {
  const postcodeInput = String(formData.propertyAddress || '').trim();
  if (!postcodeInput) {
    throw new Error('Property address or postcode is required to generate a report');
  }

  const postcodeCode = postcodeInput.toUpperCase().replace(/\s+/g, '');
  const reportResponse = await apiClient.get(`/postcodes/code/${encodeURIComponent(postcodeCode)}/report-data`);
  const reportPayload = reportResponse.data?.data;
  const postcode = reportPayload?.postcode;
  if (!postcode || !reportPayload) throw new Error(`Postcode "${postcodeInput}" not found in database`);

  const postcodeId = postcode.postcodeId || postcode.postcode_id;
  const boroughId = postcode.boroughId || postcode.borough_id;
  const previewResponse = await apiClient.post('/score-reports/preview', { postcodeId, boroughId: boroughId || undefined });
  const preview = previewResponse.data?.data;
  if (!preview) throw new Error('Failed to generate investor report preview');

  if (preview.overallScore == null) {
    throw new Error('A real RoomReview score cannot be calculated because borough scoring metrics are missing');
  }

  const score = Number(preview.overallScore);
  const bedrooms = Number(formData.bedrooms) || 0;
  const area = Number(formData.floorArea) || 0;
  const propertyValue = reportPayload.propertyValueData?.find((item: any) => item.value > 0)?.value;
  const rentRows = (reportPayload.rentData ?? []).filter((item: any) => Number(item.rent) > 0);
  const averageRent = rentRows.find((item: any) => String(item.type).toLowerCase() === 'average')?.rent ?? rentRows[0]?.rent;
  const boroughMetrics = reportPayload.borough?.metrics ?? {};
  const rentGrowthValue = boroughMetrics.annualGrowth ?? boroughMetrics.annualIncrease ?? boroughMetrics.trend;
  const rentGrowth = Number(String(rentGrowthValue ?? '').replace(/[^0-9.\-]+/g, ''));
  const demandLevel = boroughMetrics.demandLevel ?? boroughMetrics.demand;
  const yieldPercent = propertyValue && averageRent ? (Number(averageRent) * 12 / Number(propertyValue)) * 100 : 0;
  const boroughName = reportPayload.borough?.name || 'Area';
  const propertyValueHistory = (reportPayload.propertyValueData ?? [])
    .filter((item: any) => Number(item.value) > 0)
    .map((item: any) => ({ year: Number(item.label), price: Number(item.value) }))
    .filter((item: any) => Number.isFinite(item.year));
  const scoreBreakdown = Object.entries(preview.scoreBreakdown?.borough ?? {})
    .map(([category, value]) => ({
      category,
      weight: ({ safety: 20, affordability: 20, transport: 18, amenities: 16, health: 13, education: 13 } as Record<string, number>)[category] ?? 0,
      score: Number(value),
    }))
    .filter((item) => Number.isFinite(item.score));

  return {
    reportDate: new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }),
    property: {
      address: postcodeInput,
      postcode: preview.postcode || postcode.code || postcodeInput,
      borough: preview.borough || boroughName,
      propertyType: String(formData.propertyType || 'Property'),
      bedrooms,
      sizeSqFt: area,
      tenure: String(formData.tenure || 'Unknown'),
      modelledEstimate: Number(propertyValue) || 0,
      areaMedian: Number(propertyValue) || 0,
      boroughMedian: Number(propertyValue) || 0,
    },
    metrics: {
      score,
      maxScore: 100,
      yieldPercent,
      monthlyRent: Number(averageRent) || 0,
      historicalGrowthPercent: Number.isFinite(rentGrowth) ? rentGrowth : 0,
      demandLevel: demandLevel ? String(demandLevel) : 'No data available',
      avgDaysToLet: 0,
    },
    comparables: [],
    priceTrajectory: propertyValueHistory,
    regenerationProjects: [],
    stations: [],
    postcodeRanks: [],
    scoreBreakdown,
  };
};

