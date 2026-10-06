import type { BuyerInsightReportData } from '../pages/BuyerInsightReport.types';
import type { InvestorReportData } from '../types/investorReport';
import apiClient from '@/lib/apiClient';

const SCORE_CATEGORY_WEIGHTS: Record<string, number> = {
  safety: 20,
  affordability: 20,
  transport: 18,
  amenities: 16,
  health: 13,
  education: 13,
};

const calculateBoroughScoreWithCategories = (
  categories: Array<{ category: string; score: number }>,
  baselineMetrics: Record<string, unknown>,
): number | null => {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const { category, score } of categories) {
    const weight = SCORE_CATEGORY_WEIGHTS[category];
    if (weight === undefined || !Number.isFinite(score)) continue;
    weightedSum += Math.max(0, Math.min(100, score)) * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return null;

  const rawBaseline = baselineMetrics.score ?? baselineMetrics.quality;
  const parsedBaseline = typeof rawBaseline === 'number'
    ? rawBaseline
    : typeof rawBaseline === 'string' && rawBaseline.trim()
      ? Number(rawBaseline)
      : undefined;
  const rating = typeof baselineMetrics.rating === 'number'
    ? baselineMetrics.rating
    : typeof baselineMetrics.rating === 'string' && baselineMetrics.rating.trim()
      ? Number(baselineMetrics.rating)
      : undefined;
  const baselineValue = Number.isFinite(parsedBaseline)
    ? parsedBaseline
    : Number.isFinite(rating)
      ? rating! * 20
      : undefined;
  const categoryScore = weightedSum / totalWeight;
  const combinedScore = baselineValue === undefined
    ? categoryScore
    : Math.max(0, Math.min(100, baselineValue)) * 0.12 + categoryScore * 0.88;

  return Math.round(Math.max(0, Math.min(100, combinedScore)));
};

export const deriveTransportScore = (
  scoreValue: number | null | undefined,
  nearbyBusRoutes: Array<{ routeShortName?: string; destinationLabel?: string; nearestStopM?: number | null }>,
  nearestStationDetails: { distanceM?: number | null } | null | undefined,
) => {
  if (Number.isFinite(scoreValue) && scoreValue != null && scoreValue > 0) {
    return Math.max(0, Math.min(100, scoreValue));
  }

  let inferred = 0;
  if (nearestStationDetails && Number.isFinite(nearestStationDetails.distanceM)) {
    const distanceM = Number(nearestStationDetails.distanceM);
    if (distanceM <= 500) inferred += 40;
    else if (distanceM <= 1000) inferred += 30;
    else if (distanceM <= 1500) inferred += 20;
    else if (distanceM <= 2500) inferred += 10;
  }

  if (nearbyBusRoutes.length >= 10) inferred += 50;
  else if (nearbyBusRoutes.length >= 5) inferred += 35;
  else if (nearbyBusRoutes.length >= 2) inferred += 20;
  else if (nearbyBusRoutes.length >= 1) inferred += 10;

  if (inferred === 0 && (nearbyBusRoutes.length > 0 || nearestStationDetails)) {
    inferred = 15;
  }

  return Math.max(0, Math.min(100, inferred));
};

export const annualizeQuarterlyData = (observations: unknown[]) => {
  const totalsByYear = new Map<string, { total: number; count: number }>();

  for (const observation of observations) {
    if (!observation || typeof observation !== 'object') continue;
    const row = observation as { year?: unknown; value?: unknown };
    const year = String(row.year ?? '');
    const value = Number(row.value);
    if (!/^\d{4}$/.test(year) || !Number.isFinite(value) || value <= 0) continue;

    const current = totalsByYear.get(year) ?? { total: 0, count: 0 };
    current.total += value;
    current.count += 1;
    totalsByYear.set(year, current);
  }

  return [...totalsByYear.entries()]
    .map(([year, { total, count }]) => ({ year, value: total / count }))
    .sort((left, right) => Number(left.year) - Number(right.year))
    .slice(-6);
};

/**
 * Generates buyer report data by calling the backend API
 * Uses the preview endpoint (public) and additional data fetching
 */
export const generateBuyerReport = async (formData: Record<string, unknown>): Promise<BuyerInsightReportData> => {
  const postcodeCodeRaw = String(formData.propertyAddress || '').trim();

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

    let reportPayload: Record<string, unknown> = {};
    try {
      const reportResponse = await apiClient.get(`/postcodes/code/${encodeURIComponent(postcodeCode)}/report-data`);
      reportPayload = reportResponse.data?.data ?? {};
    } catch {
      // Historical charts remain empty when quarterly data is unavailable.
    }

    const priceHistory = annualizeQuarterlyData((reportPayload.priceTrendData as unknown[]) ?? [])
      .map(({ year, value }) => ({ year, priceThousands: value / 1000 }));
    const rentHistory = annualizeQuarterlyData((reportPayload.rentTrendData as unknown[]) ?? [])
      .map(({ year, value }) => ({ year, avgRentPcm: value }));
    const demographicRows = Array.isArray(reportPayload.demography)
      ? reportPayload.demography as Array<Record<string, unknown>>
      : [];
    const ageDistribution = demographicRows
      .map((row) => ({
        name: String(row.age_group ?? ''),
        percentage: Number(row.percentage),
      }))
      .filter((row) => row.name.length > 0 && Number.isFinite(row.percentage) && row.percentage >= 0 && row.percentage <= 100);
    const transportPayload = reportPayload.transport as {
      lsoaCode?: string;
      busRoutes?: Array<Record<string, unknown>>;
      nearestStation?: Record<string, unknown> | null;
    } | null | undefined;
    const nearbyBusRoutes = (transportPayload?.busRoutes ?? []).map((route) => ({
      routeShortName: String(route.routeShortName ?? ''),
      destinationLabel: String(route.destinationLabel ?? 'Destination unavailable'),
      agencyName: route.agencyName == null ? null : String(route.agencyName),
      isNight: route.isNight === true,
      tripsInArea: route.tripsInArea == null ? null : Number(route.tripsInArea),
      nearestStopName: route.nearestStopName == null ? null : String(route.nearestStopName),
      nearestStopM: route.nearestStopM == null ? null : Number(route.nearestStopM),
    })).filter((route) => route.routeShortName.length > 0);
    const station = transportPayload?.nearestStation;
    const nearestStationDetails = station
      ? {
          name: String(station.name ?? 'Nearest station'),
          distanceM: Number(station.distanceM),
          walkMinutesEstimate: Number(station.walkMinutesEstimate),
        }
      : null;
    const nearbyStations = nearestStationDetails
      ? [{
          name: nearestStationDetails.name,
          distanceMi: nearestStationDetails.distanceM / 1609.344,
          walkTimeMins: nearestStationDetails.walkMinutesEstimate,
          lines: [],
        }]
      : [];
    const rentRows = Array.isArray(reportPayload.rentData)
      ? reportPayload.rentData as Array<Record<string, unknown>>
      : [];
    const averageRent = rentRows.find((row) => String(row.type).toLowerCase() === 'average')?.rent
      ?? rentRows.find((row) => Number(row.rent) > 0)?.rent;
    const propertyRows = Array.isArray(reportPayload.propertyValueData)
      ? reportPayload.propertyValueData as Array<Record<string, unknown>>
      : [];
    const latestPropertyValue = propertyRows.find((row) =>
      /^\d{4}Q[1-4]$/.test(String(row.label)) && Number(row.value) > 0,
    );
    const crimeRows = Array.isArray(reportPayload.crimeData)
      ? reportPayload.crimeData as Array<Record<string, unknown>>
      : [];
    const crimeRateContext = reportPayload.crimeRateContext as {
      boroughName?: string;
      year?: number;
      population?: number;
      annualisedCrimes?: number;
      ratePer1000?: number;
      londonAveragePer1000?: number;
    } | null | undefined;
    const totalCrimeRow = crimeRows.find((row) => row.label === 'Total crimes per 1,000');
    const totalCrimeRate = crimeRateContext?.ratePer1000 ?? totalCrimeRow?.value;
    const londonCrimeAverage = crimeRateContext?.londonAveragePer1000 ?? totalCrimeRow?.comparisonValue;
    const boroughName = String((reportPayload.borough as { name?: unknown } | null)?.name ?? 'Borough');
    const crimeBoroughName = crimeRateContext?.boroughName ?? boroughName;
    const crimePopulation = Number(crimeRateContext?.population);
    const annualisedCrimes = Number(crimeRateContext?.annualisedCrimes);
    const crimeRateYear = Number(crimeRateContext?.year);
    const calculatedCrimeRate = annualisedCrimes / crimePopulation * 1000;
    const housingStockRows = Array.isArray(reportPayload.housingStockData)
      ? reportPayload.housingStockData as Array<Record<string, unknown>>
      : [];
    const netHousingAdditions = housingStockRows.find((row) => row.label === 'Net additions')?.value;
    const boroughMetrics = (reportPayload.borough as { metrics?: Record<string, unknown> } | null)?.metrics;
    const boroughAverageRent = Number(String(boroughMetrics?.avgRent ?? '').replace(/[^0-9.]/g, ''));
    const rentalDemandLevel = Number(averageRent) > 0 && boroughAverageRent > 0
      ? Number(averageRent) > boroughAverageRent ? 'High Rental Demand'
        : Number(averageRent) < boroughAverageRent ? 'Low Rental Demand'
          : 'Average Rental Demand'
      : null;
    const housingStockTrendRows = (Array.isArray(reportPayload.housingStockTrendData)
      ? reportPayload.housingStockTrendData as Array<Record<string, unknown>>
      : [])
      .map((row) => ({ year: Number(row.year), netAdditions: Number(row.netAdditions) }))
      .filter((row) => Number.isFinite(row.year) && Number.isFinite(row.netAdditions))
      .sort((first, second) => second.year - first.year);
    const latestHousingStock = housingStockTrendRows[0];
    const previousHousingStock = housingStockTrendRows[1];
    const housingGrowthLabel = latestHousingStock && previousHousingStock
      ? latestHousingStock.netAdditions > previousHousingStock.netAdditions ? 'High Development'
        : latestHousingStock.netAdditions < previousHousingStock.netAdditions ? 'Low Development'
          : 'Stable Development'
      : null;
    const housingGrowthDetail = latestHousingStock && previousHousingStock
      ? `Net additions ${latestHousingStock.netAdditions.toLocaleString('en-GB')} in ${latestHousingStock.year} vs ${previousHousingStock.netAdditions.toLocaleString('en-GB')} in ${previousHousingStock.year}`
      : null;
    const crimeRatio = Number(totalCrimeRate) / Number(londonCrimeAverage);
    const crimeLevel = Number.isFinite(crimeRatio) && Number(londonCrimeAverage) > 0
      ? crimeRatio <= 0.75 ? 'Much lower crime'
        : crimeRatio <= 0.9 ? 'Lower crime'
          : crimeRatio <= 1.1 ? 'Near average'
            : crimeRatio <= 1.25 ? 'Above-average crime'
              : crimeRatio <= 1.5 ? 'High crime'
                : 'Very high crime'
      : 'Rating unavailable';
    const formatCurrency = (value: number) => `£${Math.round(value).toLocaleString('en-GB')}`;
    const formatNumber = (value: number | null | undefined, digits = 0) => {
      if (value == null || !Number.isFinite(value)) return 'N/A';
      return Number(value).toLocaleString('en-GB', {
        maximumFractionDigits: digits,
        minimumFractionDigits: digits,
      });
    };
    const getMetricValue = (rows: Array<Record<string, unknown>>, match: RegExp) => {
      const matchValue = rows.find((row) => match.test(String(row.label ?? '').toLowerCase()));
      const value = Number(matchValue?.value ?? matchValue?.count ?? matchValue?.total ?? NaN);
      if (Number.isFinite(value)) return value;
      return null;
    };
    const educationRows = Array.isArray(reportPayload.educationData) ? reportPayload.educationData as Array<Record<string, unknown>> : [];
    const housingRows = Array.isArray(reportPayload.housingStockData) ? reportPayload.housingStockData as Array<Record<string, unknown>> : [];
    const districtRows = Array.isArray(reportPayload.districtData) ? reportPayload.districtData as Array<Record<string, unknown>> : [];
    const educationProfile = {
      title: 'Education',
      summary: educationRows.length
        ? 'School provision and academic performance data for the local borough.'
        : 'Education metrics are not available for this area yet.',
      metrics: [
        { label: 'Total schools', value: formatNumber(getMetricValue(educationRows, /total schools/i)) },
        { label: 'GCSE attainment', value: formatNumber(getMetricValue(educationRows, /gcse attainment/i), 1) },
        { label: 'Education rank', value: Number.isFinite(getMetricValue(educationRows, /education rank/i)) ? `${getMetricValue(educationRows, /education rank/i)}th` : 'N/A' },
        { label: 'Ofsted rating', value: formatNumber(getMetricValue(educationRows, /ofsted good/i)) },
      ].filter((metric) => metric.value !== 'N/A'),
    };
    const housingStockProfile = {
      title: 'Housing Stock',
      summary: housingRows.length
        ? 'Local housing supply and affordable delivery data for the area.'
        : 'Housing stock data is not available for this area yet.',
      metrics: [
        { label: 'Total dwellings', value: formatNumber(getMetricValue(housingRows, /total dwellings/i)) },
        { label: 'Net additions', value: formatNumber(getMetricValue(housingRows, /net additions/i)) },
        { label: 'Affordable starts', value: formatNumber(getMetricValue(housingRows, /affordable starts/i)) },
        { label: 'Affordable completions', value: formatNumber(getMetricValue(housingRows, /affordable completions/i)) },
      ].filter((metric) => metric.value !== 'N/A'),
    };
    const neighbourhoodProfile = {
      title: 'Neighbourhood Information',
      summary: 'Local area context, population and district-level context for the report area.',
      metrics: [
        { label: 'Borough', value: boroughName ?? 'N/A' },
        { label: 'District', value: String(districtRows[0]?.districtCode ?? districtRows[0]?.boroughName ?? 'N/A') },
        { label: 'Population', value: Number(reportPayload.demographyPopulation) > 0 ? formatNumber(Number(reportPayload.demographyPopulation)) : 'N/A' },
        { label: 'LSOA code', value: transportPayload?.lsoaCode ?? 'N/A' },
      ].filter((metric) => metric.value !== 'N/A' && metric.value !== ''),
    };
    const areaHighlights = [
      ...(rentalDemandLevel ? [{
        category: 'rent' as const,
        label: 'Rental Demand',
        value: rentalDemandLevel,
        detail: `Postcode average ${formatCurrency(Number(averageRent))} vs borough average ${formatCurrency(boroughAverageRent)} pcm`,
      }] : []),
      ...(housingGrowthLabel && housingGrowthDetail ? [{
        category: 'housing' as const,
        label: 'Housing Growth',
        value: housingGrowthLabel,
        detail: housingGrowthDetail,
      }] : []),
      ...(Number.isFinite(Number(totalCrimeRate)) ? [{
        category: 'crime' as const,
        label: 'Borough Crime Rate',
        value: crimeLevel,
        detail: Number.isFinite(calculatedCrimeRate) && crimePopulation > 0
          ? `${crimeRateYear}: ${Math.round(annualisedCrimes).toLocaleString('en-GB')} annualised crimes ÷ ${crimePopulation.toLocaleString('en-GB')} people = ${calculatedCrimeRate.toFixed(1)} per 1,000${Number.isFinite(Number(londonCrimeAverage)) ? ` · London avg ${Number(londonCrimeAverage).toFixed(1)}` : ''}`
          : Number.isFinite(Number(londonCrimeAverage))
            ? `${crimeBoroughName} borough: ${Number(totalCrimeRate).toFixed(1)} per 1,000 · London avg ${Number(londonCrimeAverage).toFixed(1)}`
            : `${crimeBoroughName} borough: ${Number(totalCrimeRate).toFixed(1)} per 1,000 · London comparison unavailable`,
      }] : []),
    ];
    const areaSnapshot = [
      Number(averageRent) > 0
        ? { metric: 'Average rent (pcm)', value: formatCurrency(Number(averageRent)) }
        : null,
      latestPropertyValue
        ? {
            metric: `Average property price (${String(latestPropertyValue.label).replace(/^(\d{4})Q([1-4])$/, '$1 Q$2')})`,
            value: formatCurrency(Number(latestPropertyValue.value)),
          }
        : null,
      Number.isFinite(Number(totalCrimeRate))
        ? {
            metric: `Crime rate · ${crimeBoroughName} borough${Number.isFinite(crimeRateYear) ? ` (${crimeRateYear})` : ''}`,
            value: `${Number(totalCrimeRate).toFixed(1)}${Number.isFinite(Number(londonCrimeAverage)) ? ` · London avg ${Number(londonCrimeAverage).toFixed(1)}` : ''}`,
          }
        : null,
      Number(netHousingAdditions) > 0
        ? { metric: 'Borough net housing additions', value: Number(netHousingAdditions).toLocaleString('en-GB') }
        : null,
      transportPayload
        ? { metric: 'Bus routes listed', value: String(nearbyBusRoutes.length) }
        : null,
      nearestStationDetails
        ? {
            metric: 'Nearest station',
            value: `${nearestStationDetails.name} · ${Math.round(nearestStationDetails.distanceM)} m`,
          }
        : null,
    ].filter((row): row is { metric: string; value: string } => row !== null);

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

    const backendOverallScore = previewData.overallScore;
    let boroughScore = previewData.boroughScore ?? backendOverallScore;
    const postcodeScore = previewData.postcodeScore ?? boroughScore;
    const boroughBreakdown = (previewData.scoreBreakdown?.borough ?? {}) as Record<string, unknown>;
    const baseScoreBreakdown = Object.entries(boroughBreakdown)
      .filter((entry): entry is [string, number] => typeof entry[1] === 'number' && Number.isFinite(entry[1]))
      .map(([category, score]) => ({ category, score }));
    const transportScoreValue = Number(
      boroughBreakdown.transport ??
      boroughBreakdown.transportScore ??
      boroughBreakdown.accessScore ??
      boroughBreakdown.publicTransportScore ??
      boroughBreakdown.commuteScore,
    );
    const derivedTransportScore = deriveTransportScore(transportScoreValue, nearbyBusRoutes, nearestStationDetails);
    const transportBreakdownScore = baseScoreBreakdown.find(({ category }) => /transport/i.test(category))?.score;
    const hasValidTransportBreakdown = Number.isFinite(transportBreakdownScore) && (transportBreakdownScore ?? 0) > 0;
    const scoreBreakdown = hasValidTransportBreakdown
      ? baseScoreBreakdown
      : [
          ...baseScoreBreakdown.filter(({ category }) => !/transport/i.test(category)),
          { category: 'transport', score: derivedTransportScore },
        ];
    const safetyScore = baseScoreBreakdown.find(({ category }) => /safety|crime/i.test(category))?.score
      ?? Number(boroughBreakdown.safety);
    const crimeRate = Number(totalCrimeRate);
    const londonCrimeRateAverage = Number(londonCrimeAverage);
    const relativeCrimeSafetyScore = Number.isFinite(crimeRate)
      && crimeRate >= 0
      && Number.isFinite(londonCrimeRateAverage)
      && londonCrimeRateAverage > 0
      ? Math.round(Math.max(0, Math.min(100, (1 - crimeRate / (2 * londonCrimeRateAverage)) * 100)))
      : undefined;
    const normalizedSafetyScore = Number.isFinite(safetyScore)
      ? Math.round(Math.max(0, Math.min(100, safetyScore)))
      : relativeCrimeSafetyScore;
    const reportScoreBreakdown = Number.isFinite(safetyScore) || relativeCrimeSafetyScore === undefined
      ? scoreBreakdown
      : [...scoreBreakdown, { category: 'safety', score: relativeCrimeSafetyScore }];
    let overallScore = backendOverallScore;
    if (!Number.isFinite(safetyScore) && relativeCrimeSafetyScore !== undefined) {
      const recalculatedBoroughScore = calculateBoroughScoreWithCategories(
        reportScoreBreakdown,
        (previewData.preview?.boroughMetrics ?? {}) as Record<string, unknown>,
      );
      if (recalculatedBoroughScore !== null) {
        boroughScore = recalculatedBoroughScore;
        overallScore = previewData.postcodeScore == null
          ? recalculatedBoroughScore
          : Math.round(recalculatedBoroughScore * 0.55 + Number(postcodeScore) * 0.45);
      }
    }
    const affordabilityScore = Number(boroughBreakdown.affordability);
    const reportSafetyScore: number | string = normalizedSafetyScore ?? 'No data';
    const affordabilityTag = Number.isFinite(affordabilityScore)
      ? affordabilityScore >= 67 ? 'Good' : affordabilityScore >= 34 ? 'Moderate' : 'Challenging'
      : 'No data';

    const reportData: BuyerInsightReportData = {
      areaSnapshot,
      availableScoreCategories: reportScoreBreakdown,
      areaHighlights,
      meta: {
        reportTitle: `Area Report for ${previewData.postcode || previewData.borough}`,
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
          floorAreaSqFt: Number(formData.floorArea || 0),
          tenure: String(formData.tenure || 'Not specified'),
          yearBuilt: Number(formData.yearBuilt) || null,
          condition: String(formData.condition || '').trim() || null,
          parking: String(formData.parking || '').trim() || null,
          garden: String(formData.garden || '').trim() || null,
          leaseYearsRemaining: Number(formData.leaseYears) || null,
          serviceChargeGroundRent: String(formData.serviceCharge || '').trim() || null,
          buyerPriority: String(formData.buyerPriority || '').trim() || null,
          epcRating: 'N/A',
          councilTaxBand: 'N/A',
        },
        targetBudget: Number(formData.budget) > 0 ? Number(formData.budget) : null,
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
        priceHistory,
        marketAnalysisParagraphs: [
          'Area has shown steady price growth over recent years.',
          'Market fundamentals remain stable with consistent appreciation.',
        ],
        disclaimerText: 'Past performance does not guarantee future results. All figures based on public records and licensed datasets.',
      },
      rentalContext: {
        avgRentPcm: 1500,
        rentHistory,
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
        totalPopulation: Number(reportPayload.demographyPopulation) > 0
          ? Number(reportPayload.demographyPopulation)
          : null,
        populationDensityPerKm2: 0,
        employmentRatePercent: 70,
        medianAge: 35,
        ageDistribution,
        householdComposition: [],
        employmentSectors: [],
        educationLevels: [],
        sourceAttribution: 'Census & Local Authority Data',
      },
      educationProfile,
      housingStockProfile,
      neighbourhoodProfile,
      transportAndConnectivity: {
        connectivityScore: Number.isFinite(derivedTransportScore) ? derivedTransportScore : null,
        nearestStationMi: nearestStationDetails ? nearestStationDetails.distanceM / 1609.344 : null,
        zone: null,
        nearbyStations,
        travelTimes: [],
        busRoutesInfo: nearbyBusRoutes.map((route) =>
          `Route ${route.routeShortName}: ${route.destinationLabel}${route.isNight ? ' (night service)' : ''}`,
        ),
        nearbyBusRoutes,
        nearestStationDetails,
        lsoaCode: transportPayload?.lsoaCode ?? null,
        cyclingAndRoadsInfo: [],
        sourceAttribution: 'RoomReview LSOA transport dataset; refresh date not recorded',
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
