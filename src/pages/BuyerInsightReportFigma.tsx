import React from 'react';
import {
  Building2,
  BusFront,
  Download,
  GraduationCap,
  Home,
  MapPinned,
  Printer,
  ShieldCheck,
  Train,
  TrendingUp,
  Users,
} from 'lucide-react';
import type { BuyerInsightReportData } from './BuyerInsightReport.types';

export const demoBuyerReportDataFigma = {
  area: 'E14 – Canary Wharf',
  title: 'Area Summary',
  narrative:
    "E14 is one of London's most exciting areas, offering excellent transport links, strong rental demand and ongoing regeneration, making it a great place to live or invest.",
  score: 78,
  rent: '£1,650 pcm',
  price: '£504,000',
  crime: 'Lower than London average',
  population: '23,392',
};

const otherHighlights = [
  { icon: Building2, label: 'Ongoing Regeneration', description: 'Billions invested in new homes, commercial spaces and infrastructure.' },
  { icon: TrendingUp, label: 'Strong Rental Market', description: 'High demand from professionals working in Canary Wharf.' },
  { icon: ShieldCheck, label: 'Green & Waterfront Living', description: 'Access to parks, riverside walks and modern amenities.' },
];

const scoreCategoryStyles: Record<string, { label: string; color: string }> = {
  safety: { label: 'Crime/Safety', color: '#EF4444' },
  transport: { label: 'Transport', color: '#F59E0B' },
  affordability: { label: 'Affordability', color: '#3B82F6' },
  amenities: { label: 'Amenities', color: '#10B981' },
  health: { label: 'Environment', color: '#6366F1' },
  education: { label: 'Education', color: '#8B5CF6' },
};

const scoreCategoryOrder = ['safety', 'transport', 'affordability', 'amenities', 'health', 'education'];

type TrendPoint = { year: string; x: number; y: number; value: string; numericValue: number };

const createTrendChart = (
  history: Array<{ year: string; value: number }>,
  formatValue: (value: number) => string,
) => {
  const validHistory = history.filter(({ year, value }) => /^\d{4}$/.test(year) && Number.isFinite(value) && value > 0);
  const maxObserved = Math.max(...validHistory.map(({ value }) => value), 0);
  const roughStep = maxObserved / 3;
  const magnitude = roughStep > 0 ? 10 ** Math.floor(Math.log10(roughStep)) : 1;
  const normalizedStep = roughStep / magnitude;
  const stepFactor = normalizedStep <= 1 ? 1 : normalizedStep <= 2 ? 2 : normalizedStep <= 5 ? 5 : 10;
  const axisMax = stepFactor * magnitude * 3;
  const points = validHistory.map(({ year, value }, index) => ({
    year,
    x: validHistory.length === 1 ? 190 : 50 + (index * 280) / (validHistory.length - 1),
    y: 140 - (value / axisMax) * 120,
    value: formatValue(value),
    numericValue: value,
  }));
  const axisLabels = [axisMax, axisMax * 2 / 3, axisMax / 3, 0].map((value) =>
    `£${value >= 1000 ? `${Number((value / 1000).toFixed(1))}k` : Math.round(value).toLocaleString('en-GB')}`,
  );

  return { points, axisLabels };
};

const createTrendPath = (points: TrendPoint[]) => points
  .map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`)
  .join(' ');

const getGrowthLabel = (points: TrendPoint[]) => {
  if (points.length < 2 || points[0].numericValue === 0) return 'Not available';
  const percent = ((points[points.length - 1].numericValue / points[0].numericValue) - 1) * 100;
  return `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`;
};

const renderTrendTooltip = (point: TrendPoint | undefined) => {
  if (!point) return null;

  const tooltipX = point.x > 250 ? point.x - 108 : point.x + 10;
  const tooltipY = Math.max(6, Math.min(point.y - 23, 116));

  return (
    <g pointerEvents="none">
      <line x1={point.x} y1="20" x2={point.x} y2="160" stroke="#CBD5E1" strokeWidth="1" />
      <circle cx={point.x} cy={point.y} r="4.5" fill="#8B0000" stroke="white" strokeWidth="2" />
      <g transform={`translate(${tooltipX} ${tooltipY})`}>
        <rect width="98" height="44" rx="4" fill="white" stroke="#E7E9EE" filter="drop-shadow(0 2px 4px rgba(15,23,42,0.12))" />
        <text x="9" y="17" fill="#475569" fontSize="10">{point.year}</text>
        <text x="9" y="34" fill="#8B0000" fontSize="11" fontWeight="700">{point.value}</text>
      </g>
    </g>
  );
};

type BuyerInsightReportFigmaProps = {
  data?: Partial<BuyerInsightReportData> | typeof demoBuyerReportDataFigma;
  trendData?: {
    priceHistory?: BuyerInsightReportData['priceTrends']['priceHistory'];
    rentHistory?: NonNullable<BuyerInsightReportData['rentalContext']['rentHistory']>;
  };
  preparedForName?: string;
  downloadAfterLoad?: boolean;
  onPrintReport?: () => void;
  onMethodologyClick?: () => void;
  onSourceClick?: (sourceId: string) => void;
};

export const BuyerInsightReportFigma: React.FC<BuyerInsightReportFigmaProps> = ({ data, trendData, preparedForName = '', downloadAfterLoad = false, onPrintReport }) => {
  const [activeRentPoint, setActiveRentPoint] = React.useState<number | null>(null);
  const [activePricePoint, setActivePricePoint] = React.useState<number | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = React.useState(false);
  const [pdfError, setPdfError] = React.useState<string | null>(null);
  const reportDocumentRef = React.useRef<HTMLDivElement>(null);
  const autoDownloadStarted = React.useRef(false);
  const reportData = data as Partial<BuyerInsightReportData> | undefined;
  const chartData = reportData;
  const transport = reportData?.transportAndConnectivity;
  const station = transport?.nearestStationDetails ?? null;
  const busRoutes = transport?.nearbyBusRoutes ?? [];
  const ageBars = (reportData?.communityProfile?.ageDistribution ?? [])
    .map(({ name, percentage }) => ({ label: name.replace('-', '–'), value: percentage }))
    .filter(({ value }) => Number.isFinite(value) && value >= 0 && value <= 100);
  const dominantAgeGroup = [...ageBars].sort((first, second) => second.value - first.value)[0];
  const reportPostcode = reportData?.meta?.postcode ?? 'Area';
  const reportAreaName = reportData?.meta?.areaName ?? 'Local area';
  const reportDate = reportData?.meta?.generatedDateText ?? 'Not available';
  const resolvedPreparedForName = preparedForName?.trim() || '';
  const agencyBranding = reportData?.agencyBranding;
  const companyName = agencyBranding?.companyName?.trim() ?? '';
  const agencyContactName = [agencyBranding?.firstName?.trim(), agencyBranding?.lastName?.trim()]
    .filter(Boolean)
    .join(' ');
  const agencyLogoDataUrl = agencyBranding?.logoDataUrl ?? '';
  const hasAgencyBranding = Boolean(companyName || agencyContactName || agencyLogoDataUrl);
  const propertyDetails = reportData?.propertyContext?.details;
  const targetBudget = reportData?.propertyContext?.targetBudget;
  const numericOverallScore = Number(reportData?.meta?.overallScore);
  const overallScore = Number.isFinite(numericOverallScore)
    ? Math.max(0, Math.min(100, numericOverallScore))
    : null;
  const availableScoreCategories = reportData?.availableScoreCategories ?? [];
  const normalizedScoreCategories = availableScoreCategories.map(({ category, score }) => ({
    category: /safety|crime/i.test(category) ? 'safety' : category,
    score,
  }));
  const hasSafetyCategory = normalizedScoreCategories.some(({ category }) => category === 'safety');
  const numericSafetyScore = Number(reportData?.meta?.safetyScore);
  const crimeMetric = reportData?.areaSnapshot?.find(({ metric }) => metric.startsWith('Crime rate'));
  const crimeHighlight = reportData?.areaHighlights?.find(({ category }) => category === 'crime');
  const scoreRows = [
    ...normalizedScoreCategories,
    ...(!hasSafetyCategory && Number.isFinite(numericSafetyScore)
      ? [{ category: 'safety', score: numericSafetyScore }]
      : []),
  ]
    .filter(({ category, score }) => scoreCategoryStyles[category] && Number.isFinite(score))
    .filter((row, index, rows) => rows.findIndex(({ category }) => category === row.category) === index)
    .sort((first, second) => scoreCategoryOrder.indexOf(first.category) - scoreCategoryOrder.indexOf(second.category));
  const scoreDisplayRows = scoreRows.some(({ category }) => category === 'safety')
    ? scoreRows.map((row) => ({ ...row, displayValue: undefined }))
    : [{
        category: 'safety',
        score: null,
        displayValue: crimeMetric?.value ?? crimeHighlight?.value ?? 'No data',
      }, ...scoreRows.map((row) => ({ ...row, displayValue: undefined }))];
  const transportScore = [...(reportData?.availableScoreCategories ?? [])]
    .find(({ category, score }) => /transport/i.test(category) && Number.isFinite(score) && score > 0)?.score;
  const rentMetric = reportData?.areaSnapshot?.find(({ metric }) => metric === 'Average rent (pcm)');
  const propertyPriceMetric = reportData?.areaSnapshot?.find(({ metric }) => metric.startsWith('Average property price'));
  const population = reportData?.communityProfile?.totalPopulation;
  const propertyPricePeriod = propertyPriceMetric?.metric.match(/\((.+)\)$/)?.[1];
  const stats = [
    {
      icon: Building2,
      value: rentMetric ? `${rentMetric.value} pcm` : 'Unavailable',
      label: 'Average Rent (pcm)',
      trend: rentMetric ? 'Latest postcode data' : 'No rent data available',
    },
    {
      icon: TrendingUp,
      value: propertyPriceMetric?.value ?? 'Unavailable',
      label: 'Average Property Price',
      trend: propertyPricePeriod ?? 'No property-price data available',
    },
    {
      icon: ShieldCheck,
      value: crimeHighlight?.value ?? 'Unavailable',
      label: 'Borough Crime Rate',
      trend: crimeMetric?.value ?? 'No borough crime data available',
    },
  ];
  const scoreCategoryWeights: Record<string, number> = {
    safety: 20,
    affordability: 20,
    transport: 18,
    amenities: 16,
    health: 13,
    education: 13,
  };
  const totalVisibleScoreWeight = scoreRows.reduce((total, row) => total + (scoreCategoryWeights[row.category] ?? 0), 0);
  const ringCircumference = 2 * Math.PI * 46;
  const scoreArcLength = ringCircumference * (overallScore ?? 0) / 100;
  const scoreRingGap = scoreArcLength >= 6 && scoreRows.length > 1 ? 3 : 0;
  const visibleScoreArc = Math.max(0, scoreArcLength - scoreRingGap * Math.max(0, scoreRows.length - 1));
  let scoreRingOffset = 0;
  const scoreRingSegments = scoreRows.map(({ category }) => {
    const color = scoreCategoryStyles[category].color;
    const categoryWeight = scoreCategoryWeights[category] ?? 0;
    const length = totalVisibleScoreWeight > 0
      ? visibleScoreArc * categoryWeight / totalVisibleScoreWeight
      : 0;
    const offset = scoreRingOffset;
    scoreRingOffset += length + scoreRingGap;
    return { color, length, offset };
  });
  const transportAccessibility = !transport
    ? 'Not rated'
    : busRoutes.length >= 10 ? 'Excellent'
      : busRoutes.length >= 3 ? 'Poor'
        : 'Very limited';
  const transportAccessibilityDetail = transport
    ? `${busRoutes.length} bus routes${station ? ` · ${station.name}, about ${station.walkMinutesEstimate} min walk` : ''}`
    : 'No transport records available';
  const additionalDataPanels = [
    ...(reportData?.educationProfile ? [{
      icon: GraduationCap,
      panel: reportData.educationProfile,
    }] : []),
    ...(reportData?.housingStockProfile ? [{
      icon: Home,
      panel: reportData.housingStockProfile,
    }] : []),
  ];
  const propertyFacts: Array<{ label: string; value: string }> = propertyDetails ? [
    { label: 'Property type', value: propertyDetails.propertyType },
    { label: 'Bedrooms', value: String(propertyDetails.bedrooms) },
    { label: 'Bathrooms', value: String(propertyDetails.bathrooms) },
    { label: 'Floor area', value: `${propertyDetails.floorAreaSqFt.toLocaleString('en-GB')} sq ft` },
    { label: 'Tenure', value: propertyDetails.tenure },
    ...(propertyDetails.yearBuilt ? [{ label: 'Year built', value: String(propertyDetails.yearBuilt) }] : []),
    ...(propertyDetails.condition ? [{ label: 'Condition', value: propertyDetails.condition }] : []),
    ...(propertyDetails.parking ? [{ label: 'Parking', value: propertyDetails.parking }] : []),
    ...(propertyDetails.garden ? [{ label: 'Outdoor space', value: propertyDetails.garden }] : []),
    ...(propertyDetails.leaseYearsRemaining ? [{ label: 'Lease remaining', value: `${propertyDetails.leaseYearsRemaining} years` }] : []),
    ...(propertyDetails.serviceChargeGroundRent ? [{ label: 'Service charge / ground rent', value: propertyDetails.serviceChargeGroundRent }] : []),
    ...(propertyDetails.buyerPriority ? [{ label: 'Buyer priority', value: propertyDetails.buyerPriority }] : []),
    ...(targetBudget != null ? [{
      label: 'Target budget',
      value: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })
        .format(targetBudget),
    }] : []),
  ] : [];
  const heroHighlights = [
    {
      icon: Train,
      label: 'Transport Accessibility',
      value: transportAccessibility,
      detail: transportAccessibilityDetail,
    },
    ...(reportData?.areaHighlights ?? []).map((highlight) => ({
      icon: highlight.category === 'rent' ? TrendingUp : highlight.category === 'housing' ? Building2 : ShieldCheck,
      label: highlight.label,
      value: highlight.value,
      detail: highlight.detail,
    })),
  ];
  const transportRows = [
    ...(station ? [{
      icon: Train,
      title: station.name,
      detail: 'Nearest station',
      distance: `${Math.round(station.distanceM)} m · about ${station.walkMinutesEstimate} min walk`,
    }] : []),
    ...busRoutes.slice(0, 5).map((route) => ({
      icon: BusFront,
      title: `Bus ${route.routeShortName}`,
      detail: `${route.destinationLabel}${route.isNight ? ' · Night service' : ''}`,
      distance: route.nearestStopName
        ? `${route.nearestStopName}${route.nearestStopM == null ? '' : ` · ${Math.round(route.nearestStopM)} m`}`
        : 'Nearby stop data unavailable',
    })),
  ];
  const transportHighlight = station
    ? {
        icon: Train,
        label: 'Nearest station',
        description: `${station.name} is ${Math.round(station.distanceM)} m away; about ${station.walkMinutesEstimate} min walk.`,
      }
    : busRoutes.length
      ? {
          icon: BusFront,
          label: `${busRoutes.length} bus routes listed`,
          description: `Route ${busRoutes[0].routeShortName} serves ${busRoutes[0].destinationLabel}.`,
        }
      : {
          icon: BusFront,
          label: 'Transport data unavailable',
          description: 'No transport records are available for this area.',
        };
  const highlights = [transportHighlight, ...otherHighlights];
  const rentTrendChart = createTrendChart(
    (trendData?.rentHistory?.length ? trendData.rentHistory : chartData?.rentalContext?.rentHistory)?.map(({ year, avgRentPcm }) => ({ year, value: avgRentPcm })) ?? [],
    (value) => `£${Math.round(value).toLocaleString('en-GB')} pcm`,
  );
  const rentTrendPoints = rentTrendChart.points;
  const propertyPriceTrendChart = createTrendChart(
    (trendData?.priceHistory?.length ? trendData.priceHistory : chartData?.priceTrends?.priceHistory)?.map(({ year, priceThousands }) => ({ year, value: priceThousands * 1000 })) ?? [],
    (value) => `£${Math.round(value).toLocaleString('en-GB')}`,
  );
  const propertyPriceTrendPoints = propertyPriceTrendChart.points;

  const handleDownloadPdf = async () => {
    const reportDocument = reportDocumentRef.current;
    if (!reportDocument || isDownloadingPdf) return;

    setIsDownloadingPdf(true);
    setPdfError(null);
    try {
      const { downloadReportPdf } = await import('@/utils/downloadReportPdf');
      const postcodeFilename = reportPostcode.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      await downloadReportPdf(reportDocument, `roomreview-${postcodeFilename || 'property-report'}.pdf`);
    } catch (error) {
      console.error('Buyer report PDF export failed', error);
      setPdfError('PDF could not be created. Please try printing the report instead.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  React.useEffect(() => {
    if (!downloadAfterLoad || autoDownloadStarted.current) return;
    autoDownloadStarted.current = true;
    const timeoutId = window.setTimeout(() => void handleDownloadPdf(), 500);
    return () => window.clearTimeout(timeoutId);
  }, [downloadAfterLoad]);

  return (
    <div className="buyer-report-page min-h-screen bg-white px-4 py-8 text-[#1A202C] antialiased">
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          html, body, #root { min-height: 0 !important; background: #fff !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .buyer-report-page { min-height: 0 !important; padding: 0 !important; background: #fff !important; }
          .buyer-report-document { max-width: none !important; overflow: visible !important; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; }
          .buyer-report-print-control { display: none !important; }
        }
      `}</style>
      <div className="buyer-report-print-control mx-auto mb-4 max-w-[1240px]">
        <div className="flex flex-wrap justify-end gap-2">
          {onPrintReport && (
            <button
              type="button"
              onClick={onPrintReport}
              className="inline-flex items-center gap-2 rounded-md border border-[#8B0000] bg-white px-4 py-2 text-sm font-semibold text-[#8B0000] transition-colors hover:bg-[#8B0000]/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0000]"
              aria-label="Print report"
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              Print
            </button>
          )}
          <button
            type="button"
            onClick={() => void handleDownloadPdf()}
            disabled={isDownloadingPdf}
            className="inline-flex items-center gap-2 rounded-md bg-[#8B0000] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#700000] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0000] disabled:cursor-wait disabled:opacity-60"
            aria-label="Download report as PDF"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {isDownloadingPdf ? 'Preparing PDF...' : 'Download PDF'}
          </button>
        </div>
        {pdfError && <p className="mt-2 text-right text-sm text-red-700" role="alert">{pdfError}</p>}
      </div>
      <div ref={reportDocumentRef} className="buyer-report-document mx-auto max-w-[1240px] overflow-hidden rounded-[24px] border border-[#E7DFDB] bg-[#F8F3F1] shadow-[0_22px_60px_rgba(15,23,42,0.12)]">
        {/* TOP HEADER */}
        <header className="border-b-[3px] border-[#8B0000] bg-white px-5 py-5 md:px-8 md:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {hasAgencyBranding && (
              <div className="flex items-center gap-4">
                {agencyLogoDataUrl && (
                  <img
                    src={agencyLogoDataUrl}
                    alt={companyName ? `${companyName} logo` : 'Agency logo'}
                    className="h-[56px] w-[56px] rounded-[6px] object-contain"
                  />
                )}
                {(companyName || agencyContactName) && (
                  <div>
                    {companyName && (
                      <div className="text-[14px] font-black uppercase tracking-[0.15em] text-[#111827]">
                        {companyName}
                      </div>
                    )}
                    {agencyContactName && (
                      <div className="text-[11px] text-slate-500">{agencyContactName}</div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-1 items-center justify-center text-center">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#8B0000]">{reportPostcode} AREA INTELLIGENCE REPORT</div>
                <div className="mt-1 text-[16px] font-bold text-[#111827]">{reportAreaName}</div>
                <div className="text-[12px] text-slate-500">Generated: {reportDate}</div>
                {resolvedPreparedForName ? (
                  <div className="mt-1 text-[11px] text-slate-500">
                    Prepared for <span className="font-bold text-[#8B0000]">{resolvedPreparedForName}</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="text-right lg:min-w-[180px]">
              <div className="text-[22px] font-black tracking-tight text-[#111827]">
                <span className="text-[#8B0000]">Room</span>
                <span className="text-[#111827]">Review</span>
              </div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400">Property intelligence</div>
            </div>
          </div>
        </header>

        <main className="bg-white p-4 md:p-6 space-y-6">
          {propertyFacts.length > 0 && (
            <section className="border-y border-[#E7DFDB] py-5" aria-label="Submitted property details">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Property details</h2>
                <p className="text-[10px] text-slate-500">Based on the information you entered</p>
              </div>
              <dl className="grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
                {propertyFacts.map(({ label, value }) => (
                  <div key={label} className="min-w-0">
                    <dt className="text-[10px] text-slate-500">{label}</dt>
                    <dd className="mt-0.5 break-words text-[12px] font-semibold text-[#1B2430]">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* HERO BANNER SECTION */}
          <section className="grid overflow-hidden rounded-[22px] border border-[#D7CFC7] bg-[#0B132B] text-white md:grid-cols-[1.18fr_0.82fr]">
            <div className="relative px-7 py-8 md:px-10 md:py-10 flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_35%),linear-gradient(135deg,#0b132b_0%,#0f172a_100%)]" />
              <div className="relative z-10">
                <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#D84C5D]">{reportPostcode} · {reportAreaName}</div>
                <h2 className="mt-3 text-[42px] font-black uppercase leading-[0.95] tracking-[-0.03em] md:text-[54px]">AREA SUMMARY</h2>
                <p className="mt-4 max-w-[520px] text-[13px] leading-[1.65] text-slate-300">
                  {reportData?.summaryOfFindings?.narrativeSummary ?? 'Area summary unavailable.'}
                </p>

                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {heroHighlights.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="rounded-[12px] bg-[#0F1C2F] p-3 shadow-sm">
                      <div className="mb-2 flex h-9 w-9 items-center justify-center text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-300">{label}</div>
                      <div className="mt-0.5 text-[13px] font-bold text-white">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative min-h-[360px] bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80')" }}>
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,19,43,0.05)_0%,rgba(11,19,43,0.65)_100%)]" />
              <div className="absolute right-4 top-4 rounded-[10px] border border-white/20 bg-[#0B132B]/80 px-3 py-1.5 text-center backdrop-blur-md">
                <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-white">Scan to view</div>
                <div className="text-[8px] text-slate-300">{reportPostcode} on RoomReview</div>
                <div className="mt-1 bg-white p-1 rounded">
                  <div className="h-10 w-10 bg-[#0B132B] flex items-center justify-center text-white text-[8px] font-mono">QR</div>
                </div>
                <div className="mt-1 text-[7px] text-slate-400">roomreview.co.uk/{reportPostcode.toLowerCase()}</div>
              </div>
            </div>
          </section>

          {/* ROOMREVIEW SCORE & KEY METRICS ROW */}
          <section className="grid gap-6 rounded-[22px] border border-[#E5DCD8] bg-white p-6 shadow-sm lg:grid-cols-[1.35fr_1fr]">
            {/* SCORE CARD */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.26em] text-slate-500">ROOMREVIEW SCORE ⓘ</div>
                </div>
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-[180px_1fr] sm:items-center">
                <div className="flex items-center justify-center">
                  <div className="relative h-[160px] w-[160px]">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="46" stroke="#E6E1DB" strokeWidth="10" fill="transparent" />
                      {scoreRingSegments.map(({ color, length, offset }) => (
                        <circle
                          key={color}
                          cx="60"
                          cy="60"
                          r="46"
                          stroke={color}
                          strokeWidth="10"
                          strokeLinecap="round"
                          fill="transparent"
                          strokeDasharray={`${length} ${ringCircumference - length}`}
                          strokeDashoffset={-offset}
                        />
                      ))}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <div className="text-[38px] font-black leading-none text-[#1B2430]">{overallScore ?? '—'}</div>
                      <div className="text-[11px] text-slate-500 font-semibold">/100</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[12px]">
                  {scoreDisplayRows.map(({ category, score, displayValue }, index) => {
                    const style = scoreCategoryStyles[category];
                    const hasFollowingRow = index < scoreDisplayRows.length - 2;

                    return (
                      <div key={category} className={`flex items-center justify-between ${hasFollowingRow ? 'border-b border-[#E8DED9] pb-2' : 'pb-1'}`}>
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: style.color }} />
                          {style.label}
                        </span>
                        <span className="font-bold text-[#1B2430]">{displayValue ?? (score == null ? 'No data' : Math.round(score))}</span>
                      </div>
                    );
                  })}
                  {!scoreRows.length && <p className="col-span-2 text-[12px] text-slate-500">No category scores available.</p>}
                </div>
              </div>
            </div>

            {/* KEY METRICS CARDS */}
            <div className="grid grid-cols-2 self-center sm:grid-cols-4">
              {stats.map(({ icon: Icon, value, label, trend }, index) => (
                <div key={label} className={`flex flex-col items-center gap-1 px-2 text-center sm:px-3 lg:px-4 ${index > 0 ? 'border-l border-[#E7E9EE]' : ''}`}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EDF3F8] text-[#0B1733]">
                    <Icon className="h-[22px] w-[22px]" />
                  </div>
                  <div className="text-[18px] font-extrabold leading-[1.1] text-[#0B1733]">{value}</div>
                  <div className="text-[9px] leading-[1.3] text-[#657085]">{label}</div>
                  <div className="text-[9px] text-[#657085]">{trend}</div>
                </div>
              ))}
            </div>
          </section>

          {/* RENT TRENDS, PRICE TRENDS, HIGHLIGHTS */}
          <section className="grid gap-6 xl:grid-cols-[1.1fr_1.1fr_0.9fr]">
            {/* RENT TRENDS */}
            <div className="rounded-[22px] border border-[#E5DCD8] bg-white p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.26em] text-slate-500">RENT TRENDS (AVERAGE PCM)</div>
                </div>
                <div className="h-[200px] w-full">
                  <svg
                    viewBox="0 0 360 180"
                    className="h-full w-full overflow-visible"
                    onMouseMove={(event) => {
                      const screenMatrix = event.currentTarget.getScreenCTM();
                      if (!screenMatrix) return;
                      const pointer = event.currentTarget.createSVGPoint();
                      pointer.x = event.clientX;
                      pointer.y = event.clientY;
                      const pointerX = pointer.matrixTransform(screenMatrix.inverse()).x;
                      if (!rentTrendPoints.length || pointerX < 40 || pointerX > 340) {
                        setActiveRentPoint(null);
                        return;
                      }
                      const nearestIndex = rentTrendPoints.reduce((closestIndex, point, index) =>
                        Math.abs(point.x - pointerX) < Math.abs(rentTrendPoints[closestIndex].x - pointerX) ? index : closestIndex, 0);
                      setActiveRentPoint(nearestIndex);
                    }}
                    onMouseLeave={() => setActiveRentPoint(null)}
                  >
                    <line x1="20" y1="20" x2="340" y2="20" stroke="#E7DFDB" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="20" y1="60" x2="340" y2="60" stroke="#E7DFDB" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="20" y1="100" x2="340" y2="100" stroke="#E7DFDB" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="20" y1="140" x2="340" y2="140" stroke="#E7DFDB" strokeWidth="1" strokeDasharray="3 3" />
                    
                    {rentTrendChart.axisLabels.map((label, index) => (
                      <text key={label} x="10" y={[24, 64, 104, 144][index]} fill="#94A3B8" fontSize="9">{label}</text>
                    ))}

                    {rentTrendPoints.length > 1 && <path d={createTrendPath(rentTrendPoints)} fill="none" stroke="#8B0000" strokeWidth="3" strokeLinecap="round" />}
                    {!rentTrendPoints.length && <text x="180" y="88" fill="#94A3B8" fontSize="11" textAnchor="middle">Historical data unavailable</text>}
                    {rentTrendPoints.map(({ year, x, y, value }, index) => (
                      <g key={year}>
                        <circle
                          cx={x}
                          cy={y}
                          r="12"
                          fill="transparent"
                          className="cursor-pointer focus-visible:stroke-[#0B1733] focus-visible:stroke-2"
                          tabIndex={0}
                          aria-label={`${year}: ${value}`}
                          onFocus={() => setActiveRentPoint(index)}
                          onBlur={() => setActiveRentPoint((activeIndex) => activeIndex === index ? null : activeIndex)}
                        >
                          <title>{`${year}: ${value}`}</title>
                        </circle>
                        <circle cx={x} cy={y} r="3.5" fill="#8B0000" pointerEvents="none" />
                      </g>
                    ))}
                    {renderTrendTooltip(activeRentPoint === null ? undefined : rentTrendPoints[activeRentPoint])}
                  </svg>
                </div>
                <div className="mt-2 flex justify-between text-[10px] font-semibold text-slate-400 px-6">
                  {rentTrendPoints.map(({ year }) => <span key={year}>{year}</span>)}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E8DED9] flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">5 YEAR GROWTH</span>
                <span className="text-[14px] font-black text-[#0F7A3F]">{getGrowthLabel(rentTrendPoints)}</span>
              </div>
            </div>

            {/* PROPERTY PRICE TRENDS */}
            <div className="rounded-[22px] border border-[#E5DCD8] bg-white p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.26em] text-slate-500">PROPERTY PRICE TRENDS (AVG PRICE)</div>
                </div>
                <div className="h-[200px] w-full">
                  {propertyPriceTrendPoints.length ? (
                    <svg
                      viewBox="0 0 360 180"
                      className="h-full w-full overflow-visible"
                      onMouseMove={(event) => {
                        const screenMatrix = event.currentTarget.getScreenCTM();
                        if (!screenMatrix) return;
                        const pointer = event.currentTarget.createSVGPoint();
                        pointer.x = event.clientX;
                        pointer.y = event.clientY;
                        const pointerX = pointer.matrixTransform(screenMatrix.inverse()).x;
                        if (pointerX < 40 || pointerX > 340) {
                          setActivePricePoint(null);
                          return;
                        }
                        const nearestIndex = propertyPriceTrendPoints.reduce((closestIndex, point, index) =>
                          Math.abs(point.x - pointerX) < Math.abs(propertyPriceTrendPoints[closestIndex].x - pointerX) ? index : closestIndex, 0);
                        setActivePricePoint(nearestIndex);
                      }}
                      onMouseLeave={() => setActivePricePoint(null)}
                    >
                      <line x1="20" y1="20" x2="340" y2="20" stroke="#E7DFDB" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="20" y1="60" x2="340" y2="60" stroke="#E7DFDB" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="20" y1="100" x2="340" y2="100" stroke="#E7DFDB" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="20" y1="140" x2="340" y2="140" stroke="#E7DFDB" strokeWidth="1" strokeDasharray="3 3" />

                      {propertyPriceTrendChart.axisLabels.map((label, index) => (
                        <text key={label} x="5" y={[24, 64, 104, 144][index]} fill="#94A3B8" fontSize="9">{label}</text>
                      ))}

                      {propertyPriceTrendPoints.length > 1 && <path d={createTrendPath(propertyPriceTrendPoints)} fill="none" stroke="#8B0000" strokeWidth="3" strokeLinecap="round" />}
                      {propertyPriceTrendPoints.map(({ year, x, y, value }, index) => (
                        <g key={year}>
                          <circle
                            cx={x}
                            cy={y}
                            r="12"
                            fill="transparent"
                            className="cursor-pointer focus-visible:stroke-[#0B1733] focus-visible:stroke-2"
                            tabIndex={0}
                            aria-label={`${year}: ${value}`}
                            onFocus={() => setActivePricePoint(index)}
                            onBlur={() => setActivePricePoint((activeIndex) => activeIndex === index ? null : activeIndex)}
                          >
                            <title>{`${year}: ${value}`}</title>
                          </circle>
                          <circle cx={x} cy={y} r="3.5" fill="#8B0000" pointerEvents="none" />
                        </g>
                      ))}
                      {renderTrendTooltip(activePricePoint === null ? undefined : propertyPriceTrendPoints[activePricePoint])}
                    </svg>
                  ) : (
                    <div className="flex h-full items-center justify-center px-4 text-center text-[11px] text-slate-400">
                      Historical property-price data is unavailable for {reportAreaName}.
                    </div>
                  )}
                </div>
                {propertyPriceTrendPoints.length ? (
                  <div className="mt-2 flex justify-between text-[10px] font-semibold text-slate-400 px-6">
                    {propertyPriceTrendPoints.map(({ year }) => <span key={year}>{year}</span>)}
                  </div>
                ) : null}
              </div>
              {propertyPriceTrendPoints.length > 1 ? (
                <div className="mt-4 pt-3 border-t border-[#E8DED9] flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">5 YEAR GROWTH</span>
                  <span className="text-[14px] font-black text-[#0F7A3F]">{getGrowthLabel(propertyPriceTrendPoints)}</span>
                </div>
              ) : null}
            </div>

            {/* KEY HIGHLIGHTS */}
            <div className="rounded-[6px] border border-[#E7E9EE] bg-[#F8EFEA] p-[14px] shadow-none flex flex-col justify-between">
              <div>
                <div className="mb-[14px] text-[10px] font-bold uppercase tracking-[0.5px] text-[#0B1733]">KEY HIGHLIGHTS</div>
                  {highlights.map(({ icon: Icon, label, description }) => (
                    <div key={label} className="flex items-start gap-3 py-[2px]">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] border border-[#E7E9EE] bg-white">
                        <Icon className="h-5 w-5 text-[#0B1733]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold leading-[1.2] text-[#0B1733]">{label}</div>
                        <div className="mt-[1px] text-[9px] leading-[1.4] text-[#657085]">{description}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </section>

          {/* TRANSPORT, DEMOGRAPHICS & AREA COMPARISON */}
          <section className="grid gap-6 xl:grid-cols-3">
            {/* TRANSPORT */}
            <div className="rounded-[22px] border border-[#E5DCD8] bg-white p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.26em] text-slate-500">TRANSPORT</div>
                <div className="space-y-2.5 text-[13px]">
                  {transportRows.map(({ icon: Icon, title, detail, distance }) => {
                    return (
                      <div key={`${title}-${detail}`} className="rounded-[12px] border border-[#E8DED9] bg-white p-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 shrink-0 text-[#111827]" />
                          <div className="min-w-0">
                            <div className="font-bold text-[#1B2430]">{title}</div>
                            <div className="text-[11px] text-slate-500">{detail}</div>
                          </div>
                        </div>
                        <div className="shrink-0 text-right font-bold text-[11px] text-[#6B7280]">{distance}</div>
                      </div>
                    );
                  })}
                  {!transportRows.length && <p className="text-[12px] text-slate-500">Transport records are unavailable for this area.</p>}
                </div>
              </div>
              {(transportScore != null && Number.isFinite(transportScore) && transportScore > 0)
                || (transport?.connectivityScore != null && Number.isFinite(transport.connectivityScore) && transport.connectivityScore > 0) ? (
                  <div className="mt-4 rounded-[12px] bg-[#0B132B] p-3 text-white flex items-center justify-between gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300">Transport score</span>
                    <span className="text-[11px] font-bold text-white">
                      {Math.round(transportScore ?? transport?.connectivityScore ?? 0)}/100
                    </span>
                  </div>
                ) : (
                  <div className="mt-4 rounded-[12px] bg-[#0B132B] p-3 text-white flex items-center justify-between gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300">LSOA area data</span>
                    <span className="text-[11px] font-bold text-white">{transport?.lsoaCode ?? 'Area unavailable'}</span>
                  </div>
                )}
              <p className="mt-2 text-[10px] text-slate-500">{transport?.sourceAttribution ?? 'Transport source date unavailable.'}</p>
            </div>

            {/* DEMOGRAPHICS */}
            <div className="rounded-[22px] border border-[#E5DCD8] bg-white p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.26em] text-slate-500">DEMOGRAPHICS · LSOA-WEIGHTED AGE GROUPS</div>
                {ageBars.length ? (
                  <>
                    <div className="space-y-2 text-[11px]">
                      {ageBars.map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between gap-3">
                          <span className="w-12 text-slate-600 font-medium">{label}</span>
                          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#E6E1DB]">
                            <div className="h-full rounded-full bg-[#0B132B]" style={{ width: `${Math.min(100, value * 2.5)}%` }} />
                          </div>
                          <span className="w-10 text-right font-bold text-[#1B2430]">{value.toFixed(1)}%</span>
                        </div>
                      ))}
                      </div>
                    <div className="mt-4 flex justify-between text-[10px] text-slate-400 px-1">
                      <span>0%</span><span>10%</span><span>20%</span><span>30%</span><span>40%</span>
                    </div>
                  </>
                ) : (
                  <p className="py-6 text-center text-[12px] text-slate-500">Age distribution unavailable for this area.</p>
                )}
              </div>
              {dominantAgeGroup && (
                <div className="mt-4 rounded-[12px] border border-[#E8DED9] bg-white p-3 text-center">
                  <span className="text-[11px] text-slate-500 font-medium">Largest age group: </span>
                  <span className="text-[11px] font-bold text-[#0F7A3F]">{dominantAgeGroup.label} ({dominantAgeGroup.value.toFixed(1)}%)</span>
                </div>
              )}
            </div>

            {/* AREA DATA SNAPSHOT */}
            <div className="rounded-[6px] border border-[#E7E9EE] bg-[#F8EFEA] p-[14px] shadow-none flex flex-col justify-between">
              <div>
                <div className="mb-[10px] text-[10px] font-bold uppercase tracking-[0.5px] text-[#0B1733]">
                  AREA DATA SNAPSHOT <span className="font-normal text-[#657085]">({reportPostcode})</span>
                </div>
                <div className="overflow-hidden text-[9px]">
                  <table className="w-full border-separate border-spacing-0 text-left">
                    <thead>
                      <tr>
                        <th className="pb-[6px] text-left text-[9px] font-semibold text-[#657085]">Metric</th>
                        <th className="pb-[6px] text-right text-[9px] font-semibold text-[#657085]">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reportData?.areaSnapshot ?? []).map(({ metric, value }) => (
                        <tr key={metric} className="border-t border-[#E7E9EE]">
                          <td className="py-[5px] text-[#657085]">{metric}</td>
                          <td className="py-[5px] text-right font-semibold text-[#0B1733]">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!reportData?.areaSnapshot?.length && <p className="pt-2 text-[10px] text-slate-500">No area metrics are available for this postcode.</p>}
                </div>
              </div>
            </div>
          </section>

          {additionalDataPanels.length > 0 && (
            <section className="grid gap-6 xl:grid-cols-3">
              {additionalDataPanels.map(({ icon: Icon, panel }) => (
                <div key={panel.title} className="rounded-[22px] border border-[#E5DCD8] bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#F8EFEA] text-[#8B0000]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{panel.title}</div>
                    </div>
                  </div>
                  <p className="text-[12px] leading-[1.6] text-slate-600">{panel.summary}</p>
                  <div className="mt-4 space-y-2.5">
                    {panel.metrics.map(({ label, value, detail }) => (
                      <div key={`${panel.title}-${label}`} className="rounded-[12px] border border-[#E8DED9] bg-[#FAF8F5] p-2.5">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">{label}</span>
                          <span className="text-[12px] font-bold text-[#1B2430]">{value}</span>
                        </div>
                        {detail ? <p className="mt-1 text-[10px] text-slate-500">{detail}</p> : null}
                      </div>
                    ))}
                    {!panel.metrics.length && (
                      <p className="text-[11px] text-slate-500">No additional data is available for this category yet.</p>
                    )}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* LOCAL INSIGHT & ABOUT THIS REPORT */}
          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[22px] border border-[#E5DCD8] bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#8B0000]">LOCAL INSIGHT</div>
                <p className="mt-3 text-[13px] leading-[1.7] text-slate-700">
                  E14 continues to be one of London’s strongest performer areas. With major investment in infrastructure, business hubs and residential developments, it offers excellent long-term potential for both homeowners and investors.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-[#E8DED9]">
                <div className="text-[13px] font-bold text-[#1B2430]">Thinking of buying, renting or investing in E14?</div>
                <div className="text-[12px] text-slate-600 mt-0.5">Contact ABC Estates for expert advice tailored to your needs.</div>
              </div>
            </div>

            <div className="rounded-[22px] border border-[#E5DCD8] bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.26em] text-slate-500">ABOUT THIS REPORT</div>
                <p className="mt-3 text-[12px] leading-[1.6] text-slate-600">
                  This report uses the latest data from trusted sources including ONS, Land Registry, Police UK, Transport for London and more.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-[#E8DED9] flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase text-slate-400 font-semibold">Report powered by</div>
                  <div className="text-[14px] font-black text-[#111827]">
                    <span className="text-[#8B0000]">Room</span><span>Review</span>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-slate-500">Data-driven property intelligence you can trust.</span>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          {hasAgencyBranding && (
            <footer className="flex flex-wrap items-center gap-3 rounded-[22px] border border-[#E5DCD8] bg-white p-6 shadow-sm">
              {agencyLogoDataUrl && (
                <img
                  src={agencyLogoDataUrl}
                  alt={companyName ? `${companyName} logo` : 'Agency logo'}
                  className="h-12 w-12 rounded-[6px] object-contain"
                />
              )}
              <div>
                {companyName && (
                  <div className="text-[13px] font-black uppercase tracking-[0.1em] text-[#111827]">
                    {companyName}
                  </div>
                )}
                {agencyContactName && <div className="text-[11px] text-slate-500">{agencyContactName}</div>}
              </div>
            </footer>
          )}
        </main>
      </div>
    </div>
  );
};

export const AreaIntelligenceReport = BuyerInsightReportFigma;
export default BuyerInsightReportFigma;