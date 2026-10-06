import { test, expect } from 'vitest';
import { render } from 'vitest-browser-react';
import { BuyerInsightReportFigma } from '../src/pages/BuyerInsightReportFigma';
import { deriveTransportScore } from '../src/utils/reportGenerator';

test('derives a transport score from station and bus-route data when the backend score is missing', () => {
  const score = deriveTransportScore(
    null,
    [
      { routeShortName: '25', destinationLabel: 'City', nearestStopM: 120 },
      { routeShortName: '73', destinationLabel: 'Central', nearestStopM: 180 },
      { routeShortName: 'N1', destinationLabel: 'Night route', nearestStopM: 220, },
    ],
    { distanceM: 400 },
  );

  expect(score).toBeGreaterThan(0);
  expect(score).toBeLessThanOrEqual(100);
});

test('renders education and housing stock panels when extra data is available', async () => {
  const { getByText } = await render(
    <BuyerInsightReportFigma
      data={{
        meta: {
          reportTitle: 'Area Summary',
          postcode: 'E14',
          areaName: 'Canary Wharf',
          overallScore: 78,
          safetyScore: 72,
          affordabilityTag: 'Good',
          livabilityScore: 77,
          generatedDateText: '2 October 2026',
        },
        summaryOfFindings: {
          overallAssessmentTitle: 'Area Summary',
          overallAssessmentSubtitle: 'Score: 78',
          narrativeSummary: 'Good mix of transport and amenities.',
          strengths: [],
          considerations: [],
          mayAppealTo: [],
        },
        propertyContext: {
          details: {
            propertyType: 'Apartment',
            bedrooms: 2,
            bathrooms: 1,
            floorAreaSqFt: 850,
            tenure: 'Freehold',
            epcRating: 'B',
            councilTaxBand: 'D',
          },
          targetBudget: 500000,
          marketRange: {
            indicativePrice: 500000,
            lowerRange: 450000,
            upperRange: 550000,
            disclaimer: 'Indicative range',
          },
          comparableSales: [],
        },
        areaSnapshot: [],
        areaHighlights: [],
        availableScoreCategories: [],
        priceTrends: {
          fiveYearGrowthPercent: 12,
          annualGrowthPercent: 2.5,
          vsBoroughAvgPercent: 1.5,
          priceHistory: [],
          marketAnalysisParagraphs: [],
          disclaimerText: '',
        },
        rentalContext: {
          avgRentPcm: 1800,
          demandLevel: 'High',
          avgTimeToLetDays: 14,
          grossRentalYieldPercent: 4.5,
          grossYieldSubtitle: '',
          boroughAvgYieldPercent: 4.0,
          boroughYieldSubtitle: '',
          tenantProfile: [],
          marketConditions: [],
          contextParagraphs: [],
          disclaimerText: '',
        },
        crimeAndSafety: {
          safetyScore: 72,
          crimeRateTrendPercent: 0,
          vsBoroughPercent: 0,
          crimeCategories: [],
          keyHighlights: [],
          nearbyPostcodeComparisons: [],
          sourceAttribution: '',
        },
        communityProfile: {
          disclaimerNotice: '',
          totalPopulation: 23000,
          populationDensityPerKm2: 5800,
          employmentRatePercent: 72,
          medianAge: 35,
          ageDistribution: [],
          householdComposition: [],
          employmentSectors: [],
          educationLevels: [],
          sourceAttribution: '',
        },
        transportAndConnectivity: {
          connectivityScore: 79,
          nearestStationMi: 0.4,
          zone: 'Zone 2',
          nearbyStations: [],
          travelTimes: [],
          busRoutesInfo: [],
          nearbyBusRoutes: [],
          nearestStationDetails: null,
          lsoaCode: 'E01000001',
          cyclingAndRoadsInfo: [],
          sourceAttribution: '',
        },
        localServices: {
          schools: [],
          parks: [],
          shoppingAndDining: [],
          healthcareAndLeisure: [],
          amenityOverviewParagraphs: [],
        },
        planningAndAreaChange: {
          disclaimerNotice: '',
          planningApplicationsLast12Months: 12,
          approvalRatePercent: 60,
          developmentDensity: 'Moderate',
          housingGrowth: {
            boroughTargetText: '',
            protectionStatusText: '',
            overviewText: '',
          },
          regenerationOverview: [],
          transportImprovements: [],
          contextForBuyersText: '',
        },
        scoreBreakdown: {
          overallScore: 78,
          radarData: [],
          categoryScores: [],
          weightings: [],
          methodologyNotes: [],
        },
        postcodeComparison: {
          disclaimerNotice: '',
          chartScores: [],
          rankingTable: [],
          analysisPositionText: '',
          keyObservations: [],
        },
        bottomLineText: '',
        dataSources: {
          introText: '',
          disclaimerText: '',
          sources: [],
        },
        dataAndLicensing: {
          introText: '',
          openGovernmentLicenceText: '',
          providerLicencesText: '',
          trademarksText: '',
          endorsementText: '',
          accuracyText: '',
          methodologyLinkText: '',
        },
        educationProfile: {
          title: 'Education',
          summary: 'Strong school provision and attainment.',
          metrics: [
            { label: 'Total schools', value: '48' },
            { label: 'GCSE attainment', value: '58.6' },
            { label: 'Education rank', value: '8th' },
          ],
        },
        housingStockProfile: {
          title: 'Housing Stock',
          summary: 'Stable supply with affordable delivery.',
          metrics: [
            { label: 'Total dwellings', value: '143,402' },
            { label: 'Net additions', value: '632' },
            { label: 'Affordable completions', value: '179' },
          ],
        },
        neighbourhoodProfile: {
          title: 'Neighbourhood Information',
          summary: 'Mixed-use area with strong connectivity and a growing population.',
          metrics: [
            { label: 'District', value: 'Tower Hamlets' },
            { label: 'Population', value: '23,392' },
            { label: 'Employment rate', value: '72%' },
          ],
        },
      }}
    />,
  );

  expect(document.body.textContent ?? '').toContain('Education');
  expect(document.body.textContent ?? '').toContain('Housing Stock');
  expect(document.body.textContent ?? '').not.toContain('Neighbourhood Information');
  expect(getByText('Strong school provision and attainment.')).toBeInTheDocument();
  expect(getByText('Stable supply with affordable delivery.')).toBeInTheDocument();
  expect(document.body.textContent ?? '').not.toContain('Mixed-use area with strong connectivity and a growing population.');
});
