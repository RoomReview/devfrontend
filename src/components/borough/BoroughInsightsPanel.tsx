import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { GraduationCap, Home, Shield } from 'lucide-react';
import type { BoroughApiResponse, BoroughDatasetItem } from '@/types/borough.types';

const BoroughInsightCharts = lazy(() => import('./BoroughInsightCharts'));

type InsightTab = 'housing' | 'infrastructure' | 'education' | 'policing';
type HousingView = 'price' | 'growth' | 'delivery' | 'affordable';
type EducationView = 'academic' | 'quality' | 'availability';
type EducationMeasure = 'gcse' | 'ks2';
type PolicingView = 'trend' | 'ranking' | 'profile';

const tabs: Array<{ id: InsightTab; label: string; icon: typeof Home }> = [
  { id: 'housing', label: 'Housing', icon: Home },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'policing', label: 'Policing', icon: Shield },
];

const formatValue = (label: string, value: number) => {
  const formatted = value.toLocaleString('en-GB', { maximumFractionDigits: 1 });
  if (/price|rent|band d/i.test(label)) {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value);
  }
  if (/growth|change|pass|ks2|ofsted london average/i.test(label)) return `${formatted}%`;
  if (/rank/i.test(label)) {
    const rank = Math.round(value);
    const suffix = rank % 100 >= 11 && rank % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][rank % 10] ?? 'th';
    return `${rank}${suffix}`;
  }
  return formatted;
};
const formatOrdinal = (value: number) => {
  const rank = Math.round(value);
  const suffix = rank % 100 >= 11 && rank % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][rank % 10] ?? 'th';
  return `${rank}${suffix}`;
};

const findMetric = (items: BoroughDatasetItem[], pattern: RegExp) => items.find((item) => pattern.test(item.label) && item.value !== 0);
const formatMetric = (item: BoroughDatasetItem | undefined, label?: string) => item
  ? formatValue(label ?? item.label, item.value)
  : 'Not available';
const formatEducationRank = (rank: number | undefined) => rank == null || !Number.isFinite(rank)
  ? 'Not available'
  : `${Math.round(rank)} th`;
const formatComparisonRank = (value: number | undefined, comparisonValues: number[]) => {
  if (value == null || !Number.isFinite(value) || comparisonValues.length === 0) return 'Not available';
  const rank = comparisonValues.filter((comparisonValue) => Number.isFinite(comparisonValue) && comparisonValue > value).length + 1;
  return formatEducationRank(rank);
};

const EmptyState = ({ children }: { children: ReactNode }) => (
  <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-sm text-slate-600">{children}</p>
);

const MetricCard = ({ label, value, note, accent = 'border-l-[#d8c9b8]' }: { label: string; value: string; note?: string; accent?: string }) => (
  <article className={`min-w-0 rounded-lg border border-slate-200 border-l-4 ${accent} bg-[#fbf9f6] p-4`}>
    <p className="text-[10px] font-bold uppercase text-slate-500">{label}</p>
    <p className="mt-2 break-words text-2xl font-extrabold tabular-nums text-slate-950">{value}</p>
    {note ? <p className="mt-1 text-xs text-slate-500">{note}</p> : null}
  </article>
);

const SubTabs = <T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ id: T; label: string }>;
  label: string;
}) => (
  <nav className="flex flex-wrap gap-1 border-b border-slate-200" aria-label={label} role="tablist">
    {options.map((option) => (
      <button
        key={option.id}
        type="button"
        role="tab"
        aria-selected={value === option.id}
        onClick={() => onChange(option.id)}
        className={`border-b-2 px-3 py-2 text-sm ${value === option.id ? 'border-[#8b1a1a] font-semibold text-[#8b1a1a]' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
      >
        {option.label}
      </button>
    ))}
  </nav>
);

const ChartFrame = ({ title, note, children }: { title: string; note: string; children: ReactNode }) => (
  <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
    <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <span className="text-xs text-slate-500">{note}</span>
    </header>
    {children}
  </section>
);

export default function BoroughInsightsPanel({ borough }: { borough: BoroughApiResponse }) {
  const [activeTab, setActiveTab] = useState<InsightTab>('housing');
  const [housingView, setHousingView] = useState<HousingView>('price');
  const [educationView, setEducationView] = useState<EducationView>('academic');
  const [educationMeasure, setEducationMeasure] = useState<EducationMeasure>('gcse');
  const [educationComparisonBorough, setEducationComparisonBorough] = useState('');
  const [policingView, setPolicingView] = useState<PolicingView>('trend');
  const [priceComparisonBorough, setPriceComparisonBorough] = useState('');
  const [stockMeasure, setStockMeasure] = useState<'stock' | 'additions'>('stock');

  const priceRows = borough.propertyValueData.filter((item) => !/growth/i.test(item.label) && item.value > 0);
  const growthRows = borough.propertyValueData.filter((item) => /growth/i.test(item.label) && Number.isFinite(item.value));
  const priceSeries = [...priceRows].reverse().map((item) => ({ period: item.label, value: item.value }));
  const growthSeries = [...growthRows].reverse().map((item) => ({
    period: item.label.replace(/^YoY growth\s*[·-]?\s*/i, '') || 'Latest period',
    value: item.value,
  }));
  const totalDwellings = findMetric(borough.housingStockData, /total dwellings/i);
  const netAdditions = findMetric(borough.housingStockData, /net additions/i);
  const affordableStarts = findMetric(borough.housingStockData, /affordable starts/i);
  const affordableCompletions = findMetric(borough.housingStockData, /affordable completions/i);
  const bandD = findMetric(borough.housingStockData, /band d/i);
  const priceComparisons = borough.housingPriceComparisonData ?? [];
  const stockComparisons = borough.housingStockComparisonData ?? [];
  const educationComparisons = borough.educationComparisonData ?? [];
  const policeComparisons = borough.policingComparisonData ?? [];
  const currentStock = stockComparisons.find((item) => item.boroughName.toLowerCase() === borough.name.toLowerCase());
  const averagePrice = priceComparisons.length
    ? priceComparisons.reduce((total, item) => total + item.averagePrice, 0) / priceComparisons.length
    : null;
  const averageGrowth = priceComparisons.length
    ? priceComparisons.reduce((total, item) => total + item.yoyGrowthPct, 0) / priceComparisons.length
    : null;
  const currentPricePctFromLondon = averagePrice && priceRows[0]
    ? ((priceRows[0].value - averagePrice) / averagePrice) * 100
    : null;
  const currentGrowthVsLondon = averageGrowth != null && growthRows[0]
    ? growthRows[0].value - averageGrowth
    : null;
  const housingStockRankRows = [...stockComparisons].sort((first, second) => stockMeasure === 'stock'
    ? second.totalDwellings - first.totalDwellings
    : second.netAdditions - first.netAdditions);
  const stockRankRows = housingStockRankRows;
  const educationTrend = educationMeasure === 'gcse'
    ? [49.1, 49.8, 50, 50.2, 50.4]
    : [70.1, 70.8, 71, 71.2, 71.4];
  const londonEducationTrend = educationMeasure === 'gcse'
    ? [50, 50.4, 50.5, 50.6, 50.6]
    : [71, 71.2, 71.3, 71.5, 71.5];
  const educationYears = ['2021', '2022', '2023', '2024', '2025'];
  const ofstedRankRows = [...educationComparisons].sort((first, second) => second.ofstedGoodAndOutstanding - first.ofstedGoodAndOutstanding);
  const policeRankRows = Array.from(
    [...policeComparisons]
      .sort((first, second) => second.year - first.year)
      .reduce((latestByBorough, item) => {
        const key = item.boroughName.toLowerCase();
        if (!latestByBorough.has(key)) latestByBorough.set(key, item);
        return latestByBorough;
      }, new Map<string, (typeof policeComparisons)[number]>())
      .values(),
  ).sort((first, second) => first.totalCrimesPer1000 - second.totalCrimesPer1000);
  const crimeComparisonOptions = [
    { value: 'london', label: 'London average' },
    ...policeRankRows
      .filter((item) => item.boroughName.toLowerCase() !== borough.name.toLowerCase())
      .map((item) => ({ value: item.boroughName, label: item.boroughName })),
  ];
  const affordableHistory = [...(borough.housingStockHistory ?? [])]
    .sort((first, second) => first.year - second.year)
    .map((item) => ({
      period: item.affordableFinancialYear || String(item.year),
      starts: item.affordableStarts,
      completions: item.affordableCompletions,
    }))
    .filter((item) => item.starts > 0 || item.completions > 0);
  const peakAffordableCompletions = affordableHistory.reduce((peak, item) => item.completions > peak.completions ? item : peak, affordableHistory[0] ?? { period: 'Latest year', starts: 0, completions: 0 });
  const latestAffordablePeriod = affordableHistory[affordableHistory.length - 1]?.period ?? '';
  const isPartialYear = /2025[-–]26|2025-26|2025–26/i.test(latestAffordablePeriod) || /partial year/i.test(latestAffordablePeriod);
  const averageRent = borough.rentData.find((item) => item.type === 'average' && item.rent > 0);
  const totalSchools = findMetric(borough.educationData, /total schools/i);
  const publiclyFundedSchools = findMetric(borough.educationData, /publicly funded schools/i);
  const independentSchools = findMetric(borough.educationData, /independent schools/i);
  const schoolAvailabilityPhases = [
    { label: 'Nursery', value: borough.educationData.find((item) => /publicly funded nurseries/i.test(item.label))?.value },
    { label: 'Primary', value: borough.educationData.find((item) => /publicly funded primary schools/i.test(item.label))?.value },
    { label: 'Secondary', value: borough.educationData.find((item) => /publicly funded secondary schools/i.test(item.label))?.value },
  ].filter((phase): phase is { label: string; value: number } => phase.value != null && Number.isFinite(phase.value));
  const educationRank = findMetric(borough.educationData, /education rank/i);
  const gcse = findMetric(borough.educationData, /gcse attainment/i);
  const ks2 = findMetric(borough.educationData, /ks2 expected/i);
  const ofsted = findMetric(borough.educationData, /ofsted good/i);
  const selectedEducationComparison = educationComparisons.find((item) => item.boroughName.toLowerCase() === borough.name.toLowerCase());
  const comparisonEducation = educationComparisonBorough
    ? educationComparisons.find((item) => item.boroughName === educationComparisonBorough)
    : undefined;
  const currentEducationValue = educationMeasure === 'gcse'
    ? selectedEducationComparison?.gcseAttainment8 ?? gcse?.value
    : selectedEducationComparison?.ks2ExpectedStandard ?? ks2?.value;
  const comparisonEducationValue = educationMeasure === 'gcse'
    ? comparisonEducation?.gcseAttainment8
    : comparisonEducation?.ks2ExpectedStandard;
  const comparisonEducationDelta = currentEducationValue != null
    && Number.isFinite(currentEducationValue)
    && currentEducationValue > 0
    && comparisonEducationValue != null
    && Number.isFinite(comparisonEducationValue)
    && comparisonEducationValue > 0
    ? comparisonEducationValue - currentEducationValue
    : null;
  const comparisonEducationTrend = comparisonEducationDelta == null
    ? []
    : educationTrend.map((value) => value + comparisonEducationDelta);
  const totalCrime = findMetric(borough.crimeData, /total crimes per/i);
  const crimeProfile = borough.crimeData.filter((item) => !/total crimes per/i.test(item.label) && item.value > 0);
  const mostCommonCrime = [...crimeProfile].sort((first, second) => second.value - first.value)[0];
  const largestCrimeRateGap = crimeProfile
    .filter((item) => item.comparisonValue != null && item.comparisonValue > 0 && item.value < item.comparisonValue)
    .sort((first, second) => {
      const firstGap = ((first.comparisonValue! - first.value) / first.comparisonValue!) * 100;
      const secondGap = ((second.comparisonValue! - second.value) / second.comparisonValue!) * 100;
      return secondGap - firstGap;
    })[0];
  const crimeHistory = borough.crimeTrendData ?? [];
  const [crimeTrendMeasure, setCrimeTrendMeasure] = useState<'per1000' | 'total'>('total');
  const [crimeTrendComparison, setCrimeTrendComparison] = useState<string>('london');
  const selectedCrimeComparison: { boroughName: string; value: number } | null = crimeTrendComparison === 'london'
    ? { boroughName: 'London average', value: borough.crimeTrendData?.[borough.crimeTrendData.length - 1]?.londonAveragePer1000 ?? 0 }
    : crimeTrendComparison === 'none'
      ? null
      : policeComparisons.find((item) => item.boroughName.toLowerCase() === crimeTrendComparison.toLowerCase())
        ? { boroughName: policeComparisons.find((item) => item.boroughName.toLowerCase() === crimeTrendComparison.toLowerCase())!.boroughName, value: policeComparisons.find((item) => item.boroughName.toLowerCase() === crimeTrendComparison.toLowerCase())!.totalCrimesPer1000 }
        : null;
  const crimeTrendInsight = crimeHistory.length > 1
    ? (() => {
        const firstValue = crimeHistory[0]?.totalCrimesPer1000 ?? 0;
        const currentValue = crimeHistory[crimeHistory.length - 1]?.totalCrimesPer1000 ?? 0;
        const delta = currentValue - firstValue;
        const percentage = firstValue === 0 ? 0 : (delta / firstValue) * 100;
        const directionLabel = delta <= 0 ? 'fell' : 'rose';
        const arrow = delta <= 0 ? '↓' : '↑';
        return {
          directionLabel,
          arrow,
          percentage: Math.abs(percentage),
          from: firstValue,
          to: currentValue,
        };
      })()
    : null;
  const crimeHighlight = borough.crimeHighlight;

  const housingKpis = [
    {
      label: 'Property value',
      value: formatMetric(priceRows[0], 'price'),
      note: `${growthRows[0] ? `${growthRows[0].value > 0 ? '+' : ''}${growthRows[0].value.toFixed(1)}% YoY` : 'Growth unavailable'}${currentPricePctFromLondon == null ? '' : ` · ${Math.abs(currentPricePctFromLondon).toFixed(1)}% ${currentPricePctFromLondon < 0 ? 'below' : 'above'} London`}`,
    },
    {
      label: 'Housing stock',
      value: formatMetric(totalDwellings),
      note: `${formatMetric(netAdditions)} net additions${currentStock?.totalDwellingsRank ? ` · ${formatValue('rank', currentStock.totalDwellingsRank)} largest` : ''}`,
    },
    {
      label: 'Affordable housing',
      value: formatMetric(affordableCompletions),
      note: `${currentStock?.affordableFinancialYear ?? 'Latest year'} · ${formatMetric(affordableStarts)} starts`,
    },
    {
      label: 'Council Tax D',
      value: formatMetric(bandD),
      note: currentStock?.bandDRank ? `${formatValue('rank', currentStock.bandDRank)} lowest of ${stockComparisons.length} London boroughs` : 'Latest available value',
    },
  ];
  const educationKpis = [
    { label: 'Total schools', value: formatMetric(totalSchools), note: 'all phases' },
    { label: 'Education rank', value: formatEducationRank(educationRank?.value), note: 'Estimated composite' },
    { label: 'GCSE Attainment 8', value: formatComparisonRank(selectedEducationComparison?.gcseAttainment8 ?? gcse?.value, educationComparisons.map((item) => item.gcseAttainment8)), note: 'Latest academic year' },
    { label: 'KS2 attainment', value: formatComparisonRank(selectedEducationComparison?.ks2ExpectedStandard ?? ks2?.value, educationComparisons.map((item) => item.ks2ExpectedStandard)), note: 'Reading, writing & maths' },
    { label: 'Ofsted ranking', value: formatComparisonRank(selectedEducationComparison?.ofstedGoodAndOutstanding ?? ofsted?.value, educationComparisons.map((item) => item.ofstedGoodAndOutstanding)), note: 'Good or Outstanding' },
  ];
  const policingKpis = [
    { label: 'Borough ranking', value: crimeHighlight?.rank ? `${formatValue('rank', crimeHighlight.rank)} lowest` : 'Not available', note: `Among ${policeRankRows.length} London boroughs` },
    { label: 'Total crime rate', value: formatMetric(totalCrime), note: `${crimeHighlight?.yoyChangePct == null ? '' : `${crimeHighlight.yoyChangePct > 0 ? '+' : ''}${crimeHighlight.yoyChangePct.toFixed(1)}% YoY · `}offences per 1,000 population` },
    { label: 'Lowest vs London average', value: crimeHighlight?.lowestGapPct == null ? 'Not available' : `${crimeHighlight.lowestGapPct.toFixed(0)}%`, note: crimeHighlight?.lowestGapCategory ?? 'No category gap available' },
    { label: 'Largest annual increase', value: crimeHighlight?.largestIncreasePct == null ? 'Not available' : `${crimeHighlight.largestIncreasePct > 0 ? '+' : ''}${crimeHighlight.largestIncreasePct.toFixed(0)}%`, note: crimeHighlight?.largestIncreaseCategory ?? 'No annual change available' },
  ];

  const selectedComparison = priceComparisonBorough
    ? priceComparisons.find((item) => item.boroughName === priceComparisonBorough)
    : undefined;
  const currentPriceValue = priceRows[0]?.value ?? 0;
  const currentGrowthValue = growthRows[0]?.value ?? 0;
  const comparisonPriceValue = selectedComparison?.averagePrice ?? 0;
  const comparisonGrowthValue = selectedComparison?.yoyGrowthPct ?? 0;
  const growthDifference = currentGrowthValue - comparisonGrowthValue;
  const comparisonGrowthSeries = selectedComparison?.growthHistory?.map((row) => ({
    period: row.period,
    value: row.value,
  })) ?? [];
  const priceGap = currentPriceValue - comparisonPriceValue;
  const comparisonSummary = selectedComparison
    ? `${borough.name} vs ${selectedComparison.boroughName}: ${growthDifference >= 0 ? '+' : ''}${growthDifference.toFixed(1)} pts growth, ${priceGap < 0 ? '−' : priceGap > 0 ? '+' : ''}£${Math.abs(priceGap).toLocaleString('en-GB', { maximumFractionDigits: 0 })} price gap`
    : null;

  const renderKpis = (items: Array<{ label: string; value: string; note?: string }>) => (
    <div className={`grid gap-3 sm:grid-cols-2 ${items.length === 5 ? 'xl:grid-cols-5' : 'xl:grid-cols-4'}`}>
      {items.map((item, index) => (
        <MetricCard key={item.label} {...item} accent={['border-l-[#d8c9b8]', 'border-l-[#2d75b8]', 'border-l-[#4c8b68]', 'border-l-[#d4a63a]'][index % 4]} />
      ))}
    </div>
  );

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" aria-label={`${borough.name} borough data summary`}>
      <header className="border-b border-slate-200 px-5 pt-5 sm:px-6">
        <h2 className="text-xl font-extrabold text-slate-950">Local plan summary</h2>
        <p className="mt-1 pb-4 text-sm text-slate-500">Housing, infrastructure, education and policing for {borough.name}.</p>
        <nav className="-mb-px flex flex-wrap gap-4" aria-label="Borough insight categories" role="tablist">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              aria-controls="borough-insight-panel"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 border-b-2 px-2 py-3 text-sm ${activeTab === id ? 'border-[#8b1a1a] font-semibold text-[#8b1a1a]' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </nav>
      </header>

      <div className="space-y-5 p-5 sm:p-6" id="borough-insight-panel" role="tabpanel">
        {activeTab === 'housing' ? (
          <div className="space-y-5">
            <header className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-950">Housing</h3>
                <p className="mt-1 text-sm text-slate-500">Property values, housing supply and affordable delivery in {borough.name}.</p>
              </div>
              <span className="rounded-full bg-[#f5efe8] px-3 py-1.5 text-xs font-semibold text-slate-600">Latest available data</span>
            </header>
            {renderKpis(housingKpis)}
            <SubTabs<HousingView>
              value={housingView}
              onChange={setHousingView}
              label="Housing data views"
              options={[
                { id: 'price', label: 'Property price growth' },
                { id: 'growth', label: 'Historical price growth' },
                { id: 'delivery', label: 'Housing stock & delivery' },
                { id: 'affordable', label: 'Affordable housing' },
              ]}
            />
            {housingView === 'price' ? (
              priceComparisons.length > 1 ? (
                <ChartFrame title="Average price vs. year-on-year growth — London boroughs" note={priceComparisons[0]?.period ?? 'Latest quarter'}>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-slate-500">Each point represents the latest published local-authority quarter.</div>
                    <label className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                      Compare with
                      <select
                        aria-label="Compare property prices with borough"
                        value={priceComparisonBorough}
                        onChange={(event) => setPriceComparisonBorough(event.target.value)}
                        className="hs-compare-select min-w-[190px] rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm font-normal normal-case text-slate-700"
                      >
                        <option value="">— None —</option>
                        {priceComparisons.filter((item) => item.boroughName !== borough.name).map((item) => (
                          <option key={item.boroughName} value={item.boroughName}>{item.boroughName}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <Suspense fallback={<EmptyState>Loading chart…</EmptyState>}>
                    <BoroughInsightCharts
                      kind="price-scatter"
                      data={priceComparisons.map((item) => ({ boroughName: item.boroughName, averagePrice: item.averagePrice, yoyGrowthPct: item.yoyGrowthPct }))}
                      selectedBorough={borough.name}
                      comparisonBorough={priceComparisonBorough}
                    />
                  </Suspense>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
                    {currentPricePctFromLondon != null ? (
                      <span className="rounded-md bg-amber-50 px-3 py-2 text-amber-800">
                        £{Math.abs((priceRows[0]?.value ?? 0) - (averagePrice ?? 0)).toLocaleString('en-GB', { maximumFractionDigits: 0 })} {currentPricePctFromLondon < 0 ? 'below' : 'above'} London average price
                      </span>
                    ) : null}
                    {currentGrowthVsLondon != null ? (
                      <span className="rounded-md bg-emerald-50 px-3 py-2 text-emerald-800">
                        Growth {currentGrowthVsLondon >= 0 ? 'above' : 'below'} London average ({currentGrowthVsLondon > 0 ? '+' : ''}{currentGrowthVsLondon.toFixed(1)}%)
                      </span>
                    ) : null}
                    {comparisonSummary ? (
                      <span className="inline-flex items-center rounded-md bg-[#e3f2fd] px-3 py-1.5 text-[11px] font-bold text-[#1565c0]">
                        {comparisonSummary}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-[11px] leading-relaxed text-slate-500">Source: uploaded quarterly housing-price table. Dashed lines show the mean of the comparison set.</p>
                </ChartFrame>
              ) : priceSeries.length > 1 ? (
                <ChartFrame title={`Average property price in ${borough.name}`} note="Quarterly observations">
                  <Suspense fallback={<EmptyState>Loading chart…</EmptyState>}>
                    <BoroughInsightCharts kind="price" data={priceSeries} />
                  </Suspense>
                </ChartFrame>
              ) : <EmptyState>Quarterly property-price history will appear when multiple periods are available.</EmptyState>
            ) : null}
            {housingView === 'growth' ? (
              growthSeries.length > 1 ? (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                    <h3 className="text-[20px] font-black leading-tight tracking-[-0.02em] text-[#1a2b3a]">
                      Historical quarterly property-price growth — {borough.name}
                    </h3>
                    <span className="text-xs text-slate-500">1Q 2021 – 1Q 2026</span>
                  </div>

                  <div className="p-4">
                    <div className="rounded-lg border border-slate-200 bg-[#f8f6f4] p-3">
                      <Suspense fallback={<EmptyState>Loading chart…</EmptyState>}>
                        <BoroughInsightCharts kind="growth" data={growthSeries} boroughName={borough.name} comparisonData={comparisonGrowthSeries} />
                      </Suspense>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-5 text-[11px] text-slate-600">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#8b1a1a]" />
                        {borough.name}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#1565c0]" />
                        {priceComparisonBorough || 'Comparison borough'}
                      </span>
                      <span>Values above 0% indicate year-on-year price growth</span>
                    </div>

                    <div className="mt-5 flex items-center gap-3">
                      <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Compare with:</label>
                      <select
                        aria-label="Compare historical price growth with borough"
                        className="hs-compare-select min-w-[190px] rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm font-normal normal-case text-slate-700"
                        value={priceComparisonBorough}
                        onChange={(event) => setPriceComparisonBorough(event.target.value)}
                      >
                        <option value="">— None —</option>
                        {priceComparisons.filter((item) => item.boroughName !== borough.name).map((item) => (
                          <option key={item.boroughName} value={item.boroughName}>{item.boroughName}</option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-6 inline-flex rounded-md bg-[#e8f5e9] px-3 py-2 text-[11px] font-bold text-[#2e7d32]">
                      {borough.name} YoY growth, 1Q 2026: +{(growthRows[0]?.value ?? 0).toFixed(1)}%
                    </div>

                    <p className="mt-4 text-[10.5px] leading-[1.5] text-[#aaaaaa]">
                      Source: HM Land Registry average price by local authority. Each point is year-on-year growth for that quarter vs. the same quarter one year prior. 1Q 2026 is the latest published quarter.
                    </p>
                  </div>
                </div>
              ) : <EmptyState>More than one quarterly growth observation is needed to show a trend.</EmptyState>
            ) : null}
            {housingView === 'delivery' ? (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <MetricCard label="Total dwelling stock" value={formatMetric(totalDwellings)} note="homes" />
                  <MetricCard label="Net additions" value={formatMetric(netAdditions)} note="homes" accent="border-l-[#2d75b8]" />
                  <MetricCard label="Council Tax Band D" value={formatMetric(bandD)} note={currentStock?.bandDRank ? `${currentStock.bandDRank}th lowest` : undefined} accent="border-l-[#d4a63a]" />
                </div>
                {stockRankRows.length > 0 ? (
                  <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
                    <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Housing supply across London boroughs</h4>
                        <p className="mt-1 text-xs text-slate-500">Latest year available · {stockRankRows[0]?.year}</p>
                      </div>
                      <div className="inline-flex rounded-md border border-slate-200 p-1" role="group" aria-label="Housing ranking measure">
                        <button type="button" aria-pressed={stockMeasure === 'stock'} onClick={() => setStockMeasure('stock')} className={`rounded px-2.5 py-1.5 text-xs font-semibold ${stockMeasure === 'stock' ? 'bg-[#8b1a1a] text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Total housing stock</button>
                        <button type="button" aria-pressed={stockMeasure === 'additions'} onClick={() => setStockMeasure('additions')} className={`rounded px-2.5 py-1.5 text-xs font-semibold ${stockMeasure === 'additions' ? 'bg-[#8b1a1a] text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Net additions</button>
                      </div>
                    </header>
                    <div className="mb-3 flex flex-wrap items-end justify-between gap-3 rounded-md bg-[#fbf9f6] p-3">
                      <div>
                        <p className="text-2xl font-extrabold tabular-nums text-slate-950">{formatValue('dwellings', stockMeasure === 'stock' ? (currentStock?.totalDwellings ?? 0) : (currentStock?.netAdditions ?? 0))}</p>
                        <p className="text-xs text-slate-500">{borough.name} · {stockMeasure === 'stock' ? 'homes' : 'net additions'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">{formatValue('rank', stockRankRows.findIndex((item) => item.boroughName.toLowerCase() === borough.name.toLowerCase()) + 1)} of {stockRankRows.length}</p>
                        <p className="text-xs text-slate-500">London ranking</p>
                      </div>
                    </div>
                    <div className="max-h-[360px] space-y-1 overflow-y-auto pr-1" aria-label="London borough housing ranking">
                      {stockRankRows.map((item, index) => {
                        const value = stockMeasure === 'stock' ? item.totalDwellings : item.netAdditions;
                        const max = stockMeasure === 'stock' ? stockRankRows[0].totalDwellings : Math.max(...stockRankRows.map((row) => row.netAdditions), 1);
                        const isSelected = item.boroughName.toLowerCase() === borough.name.toLowerCase();
                        return (
                          <div key={item.boroughName} className={`grid grid-cols-[minmax(110px,1.25fr)_minmax(80px,2fr)_70px] items-center gap-3 rounded px-2 py-1.5 text-xs ${isSelected ? 'bg-[#fbf2ed] font-semibold text-[#8b1a1a]' : 'text-slate-600'}`}>
                            <span className="truncate">{index + 1}. {item.boroughName}</span>
                            <span className="h-2 overflow-hidden rounded-full bg-slate-100"><span className={`block h-full rounded-full ${isSelected ? 'bg-[#8b1a1a]' : 'bg-[#d8cdbf]'}`} style={{ width: `${Math.max(2, (value / max) * 100)}%` }} /></span>
                            <span className="text-right tabular-nums">{value.toLocaleString('en-GB')}</span>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ) : <EmptyState>Housing comparison rows are unavailable.</EmptyState>}
              </div>
            ) : null}
            {housingView === 'affordable' ? (
              affordableHistory.length > 1 ? (
                <ChartFrame title={`Affordable housing starts & completions — ${borough.name}`} note="Annual GLA-funded delivery">
                  <div className="mb-3 flex justify-end gap-4 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#d8cab7]" />Starts</span>
                    <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#8b1a1a]" />Completions</span>
                  </div>
                  <Suspense fallback={<EmptyState>Loading chart…</EmptyState>}>
                    <BoroughInsightCharts kind="affordable-trend" data={affordableHistory} />
                  </Suspense>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <div className="inline-flex items-center rounded-[5px] bg-[#e3f2fd] px-3 py-1 text-[11px] font-bold text-[#1565c0]">Peak completions: {peakAffordableCompletions.completions} in {peakAffordableCompletions.period}</div>
                    {isPartialYear ? <div className="inline-flex items-center rounded-[5px] bg-[#fff3e0] px-3 py-1 text-[11px] font-bold text-[#e65100]">2025–26 is a partial year (to date)</div> : null}
                  </div>
                </ChartFrame>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <MetricCard label="Affordable starts" value={formatMetric(affordableStarts)} note="homes" />
                  <MetricCard label="Affordable completions" value={formatMetric(affordableCompletions)} note="homes" accent="border-l-[#2d75b8]" />
                </div>
              )
            ) : null}
            {averageRent ? <p className="text-xs text-slate-500">Average monthly rent: {formatValue('rent', averageRent.rent)}. Rent observations are shown in the borough rent section below.</p> : null}
          </div>
        ) : null}

        {activeTab === 'infrastructure' ? (
          <div className="space-y-4">
            <header>
              <h3 className="text-2xl font-extrabold text-slate-950">Infrastructure</h3>
              <p className="mt-1 text-sm text-slate-500">Transport, investment and major schemes in {borough.name}.</p>
            </header>
            <EmptyState>Infrastructure data is not connected yet. This tab will populate when the infrastructure dataset is available.</EmptyState>
          </div>
        ) : null}

        {activeTab === 'education' ? (
          <div className="space-y-5">
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-950">Education</h3>
                <p className="mt-1 text-sm text-slate-500">Performance, quality and school availability at a glance.</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-[#f8f5f2] px-2.5 py-1 text-[11px] font-semibold text-slate-600">London comparison · 33 boroughs</span>
            </header>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {educationKpis.map((item, index) => (
                <article key={item.label} className="education-kpi relative flex min-h-[116px] min-w-0 flex-col overflow-hidden px-4 py-[15px]" style={{ background: 'linear-gradient(145deg, #fcfaf7, #f7f2ed)', border: '1px solid #eee5dc', borderRadius: '13px', padding: '15px 16px' }}>
                  <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px]" style={{ backgroundColor: ['#d7c8b9', '#9eb7d0', '#b2c9a6', '#d4bd82', '#bd9fac'][index] }} />
                  <p className={`text-[28px] font-extrabold leading-none tabular-nums ${index === 0 ? 'text-slate-950' : 'text-[#8b1a1a]'}`}>
                    {item.value}{item.label === 'Total schools' ? <span className="ml-2 align-middle text-[11px] font-semibold text-slate-500">schools</span> : null}
                  </p>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">{item.label}</p>
                  {item.note ? <p className="mt-auto pt-2 text-[11px] text-slate-500">{item.note}</p> : null}
                </article>
              ))}
            </div>
            <SubTabs<EducationView>
              value={educationView}
              onChange={setEducationView}
              label="Education data views"
              options={[
                { id: 'academic', label: 'Academic performance' },
                { id: 'quality', label: 'School quality' },
                { id: 'availability', label: 'School availability' },
              ]}
            />
            {educationView === 'academic' ? (
              <div className="space-y-4">
                <header>
                  <h4 className="text-sm font-extrabold text-slate-950">{educationMeasure === 'gcse' ? 'GCSE Attainment 8' : 'KS2 attainment'} — five-year trend</h4>
                  <p className="mt-1 text-xs text-slate-500">{borough.name} compared with the London average and one selected borough</p>
                </header>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex rounded-lg bg-[#f3efeb] p-1" role="group" aria-label="Education attainment measure">
                    <button type="button" aria-pressed={educationMeasure === 'gcse'} onClick={() => setEducationMeasure('gcse')} className={`rounded-md px-3 py-2 text-xs font-semibold ${educationMeasure === 'gcse' ? 'bg-[#8b1a1a] text-white shadow-sm' : 'text-slate-600'}`}>GCSE Attainment 8</button>
                    <button type="button" aria-pressed={educationMeasure === 'ks2'} onClick={() => setEducationMeasure('ks2')} className={`rounded-md px-3 py-2 text-xs font-semibold ${educationMeasure === 'ks2' ? 'bg-[#8b1a1a] text-white shadow-sm' : 'text-slate-600'}`}>KS2 Attainment</button>
                  </div>
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-600">
                    Compare with:
                    <select aria-label="Compare education with borough" value={educationComparisonBorough} onChange={(event) => setEducationComparisonBorough(event.target.value)} className="min-w-[190px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-normal normal-case text-slate-700">
                      <option value="">— None —</option>
                      {educationComparisons.filter((item) => item.boroughName.toLowerCase() !== borough.name.toLowerCase()).map((item) => <option key={item.boroughName} value={item.boroughName}>{item.boroughName}</option>)}
                    </select>
                  </label>
                </div>
                <Suspense fallback={<EmptyState>Loading chart…</EmptyState>}>
                  <BoroughInsightCharts
                    kind="education-trend"
                    measureLabel={educationMeasure === 'gcse' ? 'Attainment 8' : 'KS2 attainment'}
                    data={educationYears.map((label, index) => ({ label, value: educationTrend[index] }))}
                    londonData={educationYears.map((label, index) => ({ label, value: londonEducationTrend[index] }))}
                    comparisonData={educationComparisonBorough ? educationYears.map((label, index) => ({ label, value: comparisonEducationTrend[index] })) : []}
                  />
                </Suspense>
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#8b1a1a]" />{borough.name}</span>
                  <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#626b70]" />London average</span>
                  {educationComparisonBorough ? <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2875b8]" />{educationComparisonBorough}</span> : null}
                </div>
                <p className="rounded-md bg-[#f8f5f2] px-3 py-2 text-[11px] text-slate-600">Illustrative historical values. Connect to the validated education table before publication.</p>
                <p className="text-[11px] text-slate-500">{educationMeasure === 'gcse' ? 'GCSE Attainment 8 is displayed as an average point score by academic year.' : 'KS2 attainment is displayed as the percentage meeting the expected standard.'}</p>
              </div>
            ) : null}
            {educationView === 'quality' ? (
              <OfstedRankingChart selectedBorough={borough.name} items={ofstedRankRows.map((item) => ({ boroughName: item.boroughName, value: item.ofstedGoodAndOutstanding }))} />
            ) : null}
            {educationView === 'availability' ? (
              <SchoolAvailabilityChart
                boroughName={borough.name}
                totalSchools={formatMetric(totalSchools)}
                publiclyFundedSchools={formatMetric(publiclyFundedSchools)}
                independentSchools={formatMetric(independentSchools)}
                phases={schoolAvailabilityPhases}
              />
            ) : null}
          </div>
        ) : null}

        {activeTab === 'policing' ? (
          <div className="space-y-5">
            <header className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-950">Policing</h3>
                <p className="mt-1 text-sm text-slate-500">Recorded crime rates and offence categories in {borough.name}.</p>
              </div>
              <span className="rounded-full bg-[#f5efe8] px-3 py-1.5 text-xs font-semibold text-slate-600">Latest available data</span>
            </header>
            {renderKpis(policingKpis)}
            <SubTabs<PolicingView>
              value={policingView}
              onChange={setPolicingView}
              label="Policing data views"
              options={[
                { id: 'trend', label: 'Crime trend' },
                { id: 'ranking', label: 'Borough ranking' },
                { id: 'profile', label: 'Crime profile' },
              ]}
            />
            {policingView === 'trend' ? (
              crimeHistory.length > 1 ? (
                <>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex w-fit rounded-[10px] border border-[#e7ded5] bg-[#f3eee8] p-1">
                      {[
                        { id: 'per1000', label: 'Per 1,000 population' },
                        { id: 'total', label: 'Total offences' },
                      ].map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setCrimeTrendMeasure(option.id as 'per1000' | 'total')}
                          className={`rounded-[8px] px-4 py-2 text-xs font-semibold transition-colors ${crimeTrendMeasure === option.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      <span>Compare with</span>
                      <select
                        aria-label="Compare crime trend with source"
                        value={crimeTrendComparison}
                        onChange={(event) => setCrimeTrendComparison(event.target.value)}
                        className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-normal normal-case text-slate-700"
                      >
                        <option value="london">London average</option>
                        {crimeComparisonOptions.filter((option) => option.value !== 'london').map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                        <option value="none">No comparison</option>
                      </select>
                    </div>
                  </div>
                  <ChartFrame title={`Crime rate trend in ${borough.name}`} note={crimeTrendMeasure === 'per1000' ? 'Offences per 1,000 population' : 'Total offences'}>
                    <Suspense fallback={<EmptyState>Loading chart…</EmptyState>}>
                      <BoroughInsightCharts
                        kind="crime-trend"
                        data={crimeHistory}
                        boroughName={borough.name}
                        measure={crimeTrendMeasure}
                        comparisonLabel={selectedCrimeComparison?.boroughName ?? 'London average'}
                        comparisonValue={selectedCrimeComparison?.value ?? null}
                      />
                    </Suspense>
                  </ChartFrame>
                  {crimeTrendInsight ? (
                    <div className="mt-3 flex items-center justify-between gap-4 rounded-[9px] bg-[#faf7f3] px-4 py-3 text-xs text-[#504943]">
                      <span>
                        <strong>Direction:</strong> the annual rate {crimeTrendInsight.directionLabel} from {crimeTrendInsight.from.toFixed(1)} to {crimeTrendInsight.to.toFixed(1)} {crimeTrendMeasure === 'total' ? 'total offences' : 'offences per 1,000 population'}.
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-[#8b1a1a]">
                        {crimeTrendInsight.arrow} {crimeTrendInsight.percentage.toFixed(1)}%
                      </span>
                    </div>
                  ) : null}
                </>
              ) : <EmptyState>Crime trend requires more than one annual record. The current rate is shown above.</EmptyState>
            ) : null}
            {policingView === 'ranking' ? (
              <CrimeRankingChart
                selectedBorough={borough.name}
                items={policeComparisons.map((item) => ({
                  boroughName: item.boroughName,
                  year: item.year,
                  rate: item.totalCrimesPer1000,
                  totalCount: item.totalCrimesAnnualised ?? null,
                }))}
              />
            ) : null}
            {policingView === 'profile' ? (
              crimeProfile.length > 0 ? (
                <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
                  <header className="mb-4">
                    <h3 className="text-sm font-bold text-slate-900">Recorded crime by offence type</h3>
                    <p className="mt-1 text-xs text-slate-500">Latest 12 months · offences per 1,000 population</p>
                  </header>
                  <Suspense fallback={<EmptyState>Loading chart…</EmptyState>}>
                    <BoroughInsightCharts kind="crime-profile" data={crimeProfile} boroughName={borough.name} />
                  </Suspense>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-md bg-[#faf7f3] px-4 py-3 text-xs text-[#504943]">
                    {mostCommonCrime ? <span><strong>Most common category:</strong> {mostCommonCrime.label.toLowerCase()}, at {mostCommonCrime.value.toFixed(1)} offences per 1,000 population.</span> : null}
                    {largestCrimeRateGap ? <span><strong>Largest relative gap:</strong> {largestCrimeRateGap.label.toLowerCase()} is {(((largestCrimeRateGap.comparisonValue! - largestCrimeRateGap.value) / largestCrimeRateGap.comparisonValue!) * 100).toFixed(0)}% below the London rate.</span> : null}
                  </div>
                  <p className="mt-3 text-[10px] text-slate-400">Source: recorded borough offences compared with London average rates.</p>
                </section>
              ) : <EmptyState>No crime-category data is available for {borough.name}.</EmptyState>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function CrimeRankingChart({ selectedBorough, items }: { selectedBorough: string; items: Array<{ boroughName: string; year: number; rate: number; totalCount: number | null }> }) {
  const [measure, setMeasure] = useState<'rate' | 'count'>('count');
  const [hoveredPoint, setHoveredPoint] = useState<{ boroughName: string; year: number; rank: number; x: number; y: number; isTopmost: boolean; color: string } | null>(null);
  const getValue = (item: (typeof items)[number]) => measure === 'count' ? item.totalCount : item.rate;
  const years = [...new Set(items.filter((item) => Number.isFinite(item.year)).map((item) => item.year))].sort((first, second) => first - second);
  const firstYear = years.includes(2024) ? 2024 : years[0];
  const lastYear = years.includes(2026) ? 2026 : years[years.length - 1];
  const rankForYear = (year: number) => {
    const yearRows = Array.from(items
      .filter((item) => item.year === year && Number.isFinite(getValue(item)))
      .reduce((uniqueByBorough, item) => {
        const key = item.boroughName.toLowerCase();
        if (!uniqueByBorough.has(key)) uniqueByBorough.set(key, item);
        return uniqueByBorough;
      }, new Map<string, (typeof items)[number]>())
      .values());
    const rankByBorough = new Map<string, number>();
    [...yearRows].sort((first, second) => (getValue(first) ?? 0) - (getValue(second) ?? 0)).forEach((item, index) => {
      const key = item.boroughName.toLowerCase();
      if (!rankByBorough.has(key)) rankByBorough.set(key, index + 1);
    });
    return rankByBorough;
  };
  const firstRanks = firstYear == null ? new Map<string, number>() : rankForYear(firstYear);
  const lastRanks = lastYear == null ? new Map<string, number>() : rankForYear(lastYear);
  const boroughNames = [...new Set(items.map((item) => item.boroughName))];
  const valueForYear = (boroughName: string, year: number | undefined) => {
    const item = items.find((row) => row.boroughName.toLowerCase() === boroughName.toLowerCase() && row.year === year);
    return item ? getValue(item) : null;
  };
  const rows = boroughNames.map((boroughName) => ({
    boroughName,
    firstRank: firstRanks.get(boroughName.toLowerCase()) ?? null,
    lastRank: lastRanks.get(boroughName.toLowerCase()) ?? null,
    firstValue: valueForYear(boroughName, firstYear),
    lastValue: valueForYear(boroughName, lastYear),
  })).sort((first, second) => (first.lastRank ?? Number.MAX_SAFE_INTEGER) - (second.lastRank ?? Number.MAX_SAFE_INTEGER));
  const selected = rows.find((item) => item.boroughName.toLowerCase() === selectedBorough.toLowerCase());
  const rowHeight = 31;
  const width = 968;
  const height = Math.max(rowHeight, rows.length * rowHeight);
  const labelWidth = 132;
  const chartWidth = width - labelWidth - 16;
  const xForRank = (rank: number) => labelWidth + ((rank - 1) / Math.max(rows.length - 1, 1)) * chartWidth;
  const movement = selected?.firstRank != null && selected.lastRank != null
    ? selected.firstRank - selected.lastRank
    : null;

  return rows.length > 0 ? (
    <section className="space-y-3 text-[#1b1714]">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-[#25211e]">How borough {measure === 'count' ? 'total crime' : 'crime rate'} rankings have changed</h3>
          <p className="mt-1 text-xs text-[#77716b]">{firstYear} to {lastYear} · 1st means the lowest recorded {measure === 'count' ? 'crime count' : 'crime rate'}</p>
        </div>
        <div className="inline-flex rounded-[10px] border border-[#e7ded5] bg-[#f3eee8] p-1" role="group" aria-label="Crime ranking measure">
          <button type="button" aria-pressed={measure === 'rate'} onClick={() => setMeasure('rate')} className={`rounded-[8px] px-4 py-2 text-xs font-semibold ${measure === 'rate' ? 'bg-white text-[#7c2527] shadow-sm' : 'text-slate-500'}`}>Per 1,000 population</button>
          <button type="button" aria-pressed={measure === 'count'} onClick={() => setMeasure('count')} className={`rounded-[8px] px-4 py-2 text-xs font-semibold ${measure === 'count' ? 'bg-white text-[#7c2527] shadow-sm' : 'text-slate-500'}`}>Total crime count</button>
        </div>
      </header>
      <div className="max-h-[420px] overflow-auto rounded-md" aria-label="London borough crime rank changes" tabIndex={0}>
        <svg className="block min-w-[720px] w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`London borough ${measure === 'count' ? 'total crime count' : 'crime rate'} rankings from ${firstYear} to ${lastYear}`}>
          {[1, 5, 10, 15, 20, 25, 30, rows.length].filter((rank, index, values) => rank <= rows.length && values.indexOf(rank) === index).map((rank) => {
            const x = xForRank(rank);
            return <line key={rank} x1={x} y1="0" x2={x} y2={height} stroke="#e9e6e2" strokeWidth="1" />;
          })}
          {rows.map((item, index) => {
            const isSelected = item.boroughName.toLowerCase() === selectedBorough.toLowerCase();
            const y = index * rowHeight + rowHeight / 2;
            const firstX = item.firstRank == null ? null : xForRank(item.firstRank);
            const lastX = item.lastRank == null ? null : xForRank(item.lastRank);
            const sameRank = item.firstRank != null && item.firstRank === item.lastRank;
            const firstMarkerX = firstX == null ? null : firstX - (sameRank ? 6 : 0);
            const lastMarkerX = lastX == null ? null : lastX + (sameRank ? 6 : 0);
            const firstValue = item.firstValue;
            const lastValue = item.lastValue;
            return (
              <g key={item.boroughName}>
                {isSelected ? <rect x="0" y={index * rowHeight} width={width} height={rowHeight} fill="#fbf3ef" /> : null}
                <text x={labelWidth - 10} y={y + 4} textAnchor="end" fill={isSelected ? '#8b1a1a' : '#55585a'} fontSize="10.5" fontWeight={isSelected ? '700' : '400'}>{item.boroughName}</text>
                {firstMarkerX != null && lastMarkerX != null ? <line x1={firstMarkerX} y1={y} x2={lastMarkerX} y2={y} stroke="#c9c8c6" strokeWidth="1.2" /> : null}
                {firstMarkerX != null && item.firstRank != null && firstValue != null ? (
                  <g
                    role="img"
                    aria-label={`${item.boroughName}, ${firstYear}: ${formatOrdinal(item.firstRank)} lowest`}
                    tabIndex={0}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredPoint({ boroughName: item.boroughName, year: firstYear, rank: item.firstRank!, x: firstMarkerX!, y, isTopmost: index === 0, color: '#aaa49e' })}
                    onMouseLeave={() => setHoveredPoint(null)}
                    onFocus={() => setHoveredPoint({ boroughName: item.boroughName, year: firstYear, rank: item.firstRank!, x: firstMarkerX!, y, isTopmost: index === 0, color: '#aaa49e' })}
                    onBlur={() => setHoveredPoint(null)}
                  >
                    <circle cx={firstMarkerX} cy={y} r="5.5" fill="transparent" />
                    <path d={`M ${firstMarkerX} ${y - 5} l 5 5 -5 5 -5 -5 Z`} fill="#aaa49e" pointerEvents="none"><title>{`${item.boroughName}: rank ${item.firstRank} in ${firstYear}`}</title></path>
                  </g>
                ) : null}
                {lastMarkerX != null && item.lastRank != null && lastValue != null ? (
                  <g
                    role="img"
                    aria-label={`${item.boroughName}, ${lastYear}: ${formatOrdinal(item.lastRank)} lowest`}
                    tabIndex={0}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredPoint({ boroughName: item.boroughName, year: lastYear, rank: item.lastRank!, x: lastMarkerX!, y, isTopmost: index === 0, color: isSelected ? '#8b1a1a' : '#2875b8' })}
                    onMouseLeave={() => setHoveredPoint(null)}
                    onFocus={() => setHoveredPoint({ boroughName: item.boroughName, year: lastYear, rank: item.lastRank!, x: lastMarkerX!, y, isTopmost: index === 0, color: isSelected ? '#8b1a1a' : '#2875b8' })}
                    onBlur={() => setHoveredPoint(null)}
                  >
                    <circle cx={lastMarkerX} cy={y} r="5.5" fill="transparent" />
                    <circle cx={lastMarkerX} cy={y} r={isSelected ? 5.5 : 5} fill={isSelected ? '#8b1a1a' : '#2875b8'} pointerEvents="none"><title>{`${item.boroughName}: rank ${item.lastRank} in ${lastYear}`}</title></circle>
                  </g>
                ) : null}
              </g>
            );
          })}
          {hoveredPoint ? (() => {
            const tooltipWidth = 172;
            const tooltipHeight = 38;
            const tooltipX = hoveredPoint.isTopmost
              ? hoveredPoint.x + 12
              : hoveredPoint.x < width * 0.68
              ? Math.min(hoveredPoint.x + 12, width - tooltipWidth - 4)
              : Math.max(4, hoveredPoint.x - tooltipWidth - 12);
            const tooltipY = hoveredPoint.y > 50
              ? hoveredPoint.y - tooltipHeight - 8
              : hoveredPoint.y + 12;
            return (
              <g pointerEvents="none" aria-hidden="true">
                <rect x={tooltipX} y={tooltipY} width={tooltipWidth} height={tooltipHeight} rx="5" fill="#2d2d2d" />
                <text x={tooltipX + 10} y={tooltipY + 16} fill="#ffffff" fontSize="11" fontWeight="700">{hoveredPoint.boroughName}</text>
                <rect x={tooltipX + 10} y={tooltipY + 23} width="8" height="8" rx="1" fill={hoveredPoint.color} />
                <text x={tooltipX + 24} y={tooltipY + 31} fill="#e5e7eb" fontSize="10">{hoveredPoint.year}: {formatOrdinal(hoveredPoint.rank)} lowest</text>
              </g>
            );
          })() : null}
        </svg>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-[#625d58]">
        <span className="inline-flex items-center gap-1.5"><span className="text-[#aaa49e]">◆</span>{firstYear} rank</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#2875b8]" />{lastYear} rank</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#8b1a1a]" />{selectedBorough}</span>
      </div>
      {selected && selected.firstRank != null && selected.lastRank != null && movement != null ? (
        <div className="flex items-center justify-between gap-3 rounded-md bg-[#faf7f3] px-4 py-3 text-xs text-[#504943]">
          <span><strong>{selectedBorough}:</strong> {movement > 0 ? 'improved' : movement < 0 ? 'fell' : 'remained'} from {formatOrdinal(selected.firstRank!)}-lowest in {firstYear} to {formatOrdinal(selected.lastRank!)}-lowest in {lastYear}.</span>
          <span className={`font-bold ${movement > 0 ? 'text-[#347c55]' : movement < 0 ? 'text-[#a13a32]' : 'text-slate-500'}`}>{movement > 0 ? '↑' : movement < 0 ? '↓' : '–'} {Math.abs(movement)} {Math.abs(movement) === 1 ? 'place' : 'places'}</span>
        </div>
      ) : null}
    </section>
  ) : <EmptyState>No crime ranking history is available.</EmptyState>;
}

function OfstedRankingChart({ selectedBorough, items }: { selectedBorough: string; items: Array<{ boroughName: string; value: number }> }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rows = [...items]
    .filter((item) => Number.isFinite(item.value))
    .sort((first, second) => second.value - first.value);
  const selectedIndex = rows.findIndex((item) => item.boroughName.toLowerCase() === selectedBorough.toLowerCase());
  const average = rows.length ? rows.reduce((total, item) => total + item.value, 0) / rows.length : 0;
  const rowHeight = 28;
  const width = 984;
  const height = Math.max(rowHeight, rows.length * rowHeight);
  const labelWidth = 164;
  const chartWidth = width - labelWidth - 28;

  useEffect(() => {
    const container = scrollRef.current;
    if (container && selectedIndex >= 0) {
      container.scrollTop = Math.max(0, selectedIndex * rowHeight - (container.clientHeight - rowHeight) / 2);
    }
  }, [selectedIndex, selectedBorough]);

  if (rows.length === 0) return <EmptyState>No Ofsted comparison records are available.</EmptyState>;

  return (
    <section className="space-y-3">
      <header>
        <h4 className="text-sm font-extrabold text-slate-950">Ofsted school-quality ranking</h4>
        <p className="mt-1 text-xs text-slate-500">London boroughs ranked by the percentage of schools rated Good or Outstanding</p>
      </header>
      <div ref={scrollRef} className="max-h-[360px] overflow-auto rounded-md" aria-label="London borough Ofsted school-quality ranking" tabIndex={0}>
        <svg className="block min-w-[720px] w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="London boroughs ranked by Ofsted Good or Outstanding percentage">
          {[0, 20, 40, 60, 80, 100].map((tick) => {
            const x = labelWidth + (tick / 100) * chartWidth;
            return <line key={tick} x1={x} y1="0" x2={x} y2={height} stroke="#ebe8e4" strokeWidth="1" />;
          })}
          <line x1={labelWidth + (average / 100) * chartWidth} y1="0" x2={labelWidth + (average / 100) * chartWidth} y2={height} stroke="#8c8d8e" strokeWidth="1.5" strokeDasharray="5 5" />
          {rows.map((item, index) => {
            const isSelected = item.boroughName.toLowerCase() === selectedBorough.toLowerCase();
            const y = index * rowHeight;
            const barWidth = Math.max(0, Math.min(100, item.value)) / 100 * chartWidth;
            return (
              <g key={item.boroughName}>
                {isSelected ? <rect x="0" y={y + 1} width={width} height={rowHeight - 2} fill="#fbf3ef" /> : null}
                <text x={labelWidth - 12} y={y + 18} textAnchor="end" fill={isSelected ? '#8b1a1a' : '#55585a'} fontSize="11" fontWeight={isSelected ? '700' : '400'}>{index + 1}. {item.boroughName}</text>
                <rect x={labelWidth} y={y + 6} width={barWidth} height="16" rx="4" fill={isSelected ? '#8b1a1a' : '#cdbfae'}>
                  <title>{`${item.boroughName}: ${item.value.toFixed(1)}%`}</title>
                </rect>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-slate-600">
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#8b1a1a]" />{selectedBorough}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#cdbfae]" />Other boroughs</span>
        <span> - - - London average: {average.toFixed(1)}%</span>
      </div>
      <p className="inline-flex rounded-[5px] bg-[#fff3e0] px-3 py-1.5 text-[11px] font-bold text-[#e65100]">Illustrative ranking — confirm a consistent inspection period before publication</p>
    </section>
  );
}

function SchoolAvailabilityChart({
  boroughName,
  totalSchools,
  publiclyFundedSchools,
  independentSchools,
  phases,
}: {
  boroughName: string;
  totalSchools: string;
  publiclyFundedSchools: string;
  independentSchools: string;
  phases: Array<{ label: string; value: number }>;
}) {
  const [activePhaseIndex, setActivePhaseIndex] = useState<number | null>(null);
  const width = 984;
  const height = 285;
  const margin = { top: 18, right: 18, bottom: 42, left: 48 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const maxValue = Math.max(70, Math.ceil(Math.max(...phases.map((phase) => phase.value), 0) / 10) * 10);
  const ticks = Array.from({ length: maxValue / 10 + 1 }, (_, index) => index * 10);
  const barWidth = Math.min(220, plotWidth / phases.length * 0.72);
  const y = (value: number) => margin.top + plotHeight - (value / maxValue) * plotHeight;
  const centers = phases.map((_, index) => margin.left + plotWidth * ((index + 0.5) / Math.max(phases.length, 1)));

  return (
    <div className="space-y-4">
      <header>
        <h4 className="text-sm font-extrabold text-slate-950">School availability by phase and funding type</h4>
        <p className="mt-1 text-xs text-slate-500">Counts of nursery, primary and secondary schools in {boroughName}</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { value: totalSchools, label: 'Total schools' },
          { value: publiclyFundedSchools, label: 'State-funded' },
          { value: independentSchools, label: 'Independent' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-[#e8dfd6] bg-[#fbf9f6] px-3.5 py-3">
            <p className="text-base font-extrabold tabular-nums text-slate-950">{stat.value}</p>
            <p className="text-[11px] text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>
      {phases.length > 0 ? (
        <div className="relative">
        <svg className="block h-[285px] w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Publicly funded schools by phase in ${boroughName}`}>
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={margin.left} y1={y(tick)} x2={width - margin.right} y2={y(tick)} stroke="#e8e6e2" />
            <text x={margin.left - 10} y={y(tick) + 4} textAnchor="end" fill="#6b7280" fontSize="11">{tick}</text>
          </g>
        ))}
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#d8d5d0" />
        <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#d8d5d0" />
        <text x="13" y={height / 2} textAnchor="middle" fill="#5f6b76" fontSize="11" transform={`rotate(-90 13 ${height / 2})`}>Number of schools</text>
        {phases.map((phase, index) => {
          const barX = centers[index] - barWidth / 2;
          const barY = y(phase.value);
          return (
            <g key={phase.label}>
              <rect
                x={barX}
                y={barY}
                width={barWidth}
                height={height - margin.bottom - barY}
                rx="3"
                fill="#8b1a1a"
                tabIndex={0}
                focusable="true"
                aria-label={`${phase.label}: ${phase.value} state-funded schools`}
                onMouseEnter={() => setActivePhaseIndex(index)}
                onMouseLeave={() => setActivePhaseIndex(null)}
                onMouseOver={() => setActivePhaseIndex(index)}
                onMouseOut={() => setActivePhaseIndex(null)}
                onFocus={() => setActivePhaseIndex(index)}
                onBlur={() => setActivePhaseIndex(null)}
                style={{ cursor: 'pointer' }}
              >
                <title>{`${phase.label}: ${phase.value} publicly funded schools`}</title>
              </rect>
              <text x={centers[index]} y={barY - 7} textAnchor="middle" fill="#525252" fontSize="11" fontWeight="600">{phase.value}</text>
              <text x={centers[index]} y={height - 15} textAnchor="middle" fill="#525252" fontSize="11">{phase.label}</text>
            </g>
          );
        })}
        </svg>
        {activePhaseIndex != null && phases[activePhaseIndex] ? (
          <div
            role="tooltip"
            className="pointer-events-none absolute z-10 w-[190px] rounded-md bg-[#1f1f1f] px-3 py-2 text-[10px] text-white shadow-lg"
            style={{
              left: `${Math.min(Math.max((centers[activePhaseIndex] / width) * 100, 10), 90)}%`,
              top: `${Math.max(y(phases[activePhaseIndex].value) - 70, 8)}px`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="mb-1 text-[11px] font-semibold">{phases[activePhaseIndex].label}</div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[#f4d6d2]">State-funded</span>
              <span className="font-semibold">{phases[activePhaseIndex].value}</span>
            </div>
            <div className="mt-1 text-slate-300">Independent phase count unavailable</div>
            <div className="mt-1 text-slate-300">Borough independent total: {independentSchools}</div>
          </div>
        ) : null}
        </div>
      ) : <EmptyState>Publicly funded school counts by phase are not available for {boroughName}.</EmptyState>}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-600">
        {phases.length > 0 ? <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#8b1a1a]" />State-funded</span> : null}
      </div>
      <p className="text-[11px] text-slate-500">Source: borough education dataset. Independent schools are shown as a borough total because phase-level independent counts are not available.</p>
    </div>
  );
}