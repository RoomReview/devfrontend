import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronDown, Info, ExternalLink } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import BoroughInsightsPanel from '@/components/borough/BoroughInsightsPanel';
import ThemedAreaMap from '@/components/common/ThemedAreaMap';

import { boroughService, type BoroughListItem } from '@/services/borough.service';
import type { BoroughApiResponse } from '@/types/borough.types';
import boroughImages from '@/config/boroughImages';
import boroughFallbackImage from '@img/city.jpg';
import { annualizeQuarterlyData } from '@/utils/reportGenerator';

interface VotingRecord {
  voting_data_id: string;
  year: number;
  party: string;
  percentage: number | string;
  source: string;
}


export default function BoroughPage() {
  const { id } = useParams<{ id?: string }>();
  const [selectedBorough, setSelectedBorough] = useState(() => (id ? String(id).toUpperCase() : 'BROMLEY'));
  const [selectedPropertyType, setSelectedPropertyType] = useState('ALL');
  
  const [boroughApi, setBoroughApi] = useState<BoroughApiResponse | null>(null);
  const [boroughs, setBoroughs] = useState<BoroughListItem[]>([]);
  const [selectedComparisonIds, setSelectedComparisonIds] = useState<string[]>([]);
  const [comparisonApis, setComparisonApis] = useState<BoroughApiResponse[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [heroImage, setHeroImage] = useState(boroughFallbackImage);
  const [votingRecords, setVotingRecords] = useState<VotingRecord[]>([]);
  const [hoveredDataPoint, setHoveredDataPoint] = useState<{ seriesName: string; year: string; value: number; x: number; y: number } | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setHasLoadError(false);
        const fetchId = id ?? selectedBorough.toLowerCase();
        const res = await boroughService.getById(String(fetchId));
        setBoroughApi(res);
        setHeroImage(boroughImages[res.name] ?? res.image ?? boroughFallbackImage);
        setSelectedBorough(String(res.name ?? res.slug ?? fetchId).toUpperCase());

        let availableBoroughs: BoroughListItem[] = [];
        try {
          availableBoroughs = await boroughService.getAll();
        } catch {
          availableBoroughs = [{ boroughId: res.boroughId, name: res.name, slug: res.slug }];
        }
        setBoroughs(availableBoroughs);
        const currentOption = availableBoroughs.find((borough) => borough.boroughId === res.boroughId);
        setSelectedComparisonIds(currentOption ? [currentOption.boroughId] : [res.boroughId]);
        setComparisonApis([res]);

        const types = Array.from(new Set((res.rentData ?? []).map((r: any) => ((r.type || 'ALL') as string).toUpperCase())));
        setPropertyTypes(types.length ? types : ['ALL']);

        const votingResult = await Promise.allSettled([
          apiClient.get<{ data: VotingRecord[] | null }>(`/data/voting?borough=${encodeURIComponent(res.name)}`),
        ]);
        setVotingRecords(
          votingResult[0].status === 'fulfilled' && Array.isArray(votingResult[0].value.data.data)
            ? votingResult[0].value.data.data
            : [],
        );

      } catch (e) {
        setBoroughApi(null);
        setHasLoadError(true);
        setBoroughs([]);
        setSelectedComparisonIds([]);
        setComparisonApis([]);
        setPropertyTypes(['ALL']);
        setVotingRecords([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [id]);

  useEffect(() => {
    const loadComparisonData = async () => {
      if (!selectedComparisonIds.length) {
        setComparisonApis([]);
        return;
      }

      const results = await Promise.all(
        selectedComparisonIds.map(async (boroughId) => {
          try {
            return await boroughService.getById(boroughId);
          } catch {
            return null;
          }
        }),
      );
      setComparisonApis(results.filter((result): result is BoroughApiResponse => result !== null));
    };

    void loadComparisonData();
  }, [selectedComparisonIds]);

  const primaryBoroughId = boroughApi?.boroughId ?? '';

  const toggleComparisonBorough = (boroughId: string) => {
    if (boroughId === primaryBoroughId) return;

    setSelectedComparisonIds((currentIds) => {
      if (currentIds.includes(boroughId)) {
        return currentIds.filter((currentId) => currentId !== boroughId);
      }

      return [...currentIds, boroughId];
    });
  };

  const rentDataFiltered = (boroughApi?.rentData ?? []).filter((r: any) => {
    if (!selectedPropertyType || selectedPropertyType === 'ALL') return true;
    return (r.type || '').toUpperCase() === String(selectedPropertyType).toUpperCase();
  });

  const heroTitle = boroughApi?.name ?? (selectedBorough || 'Borough');

  const comparisonSeries = comparisonApis.map((borough) => {
    const trend = annualizeQuarterlyData(borough.rentTrendData ?? [] as unknown[]);
    return {
      name: borough.name,
      values: trend.map((point) => Number(point.value)),
      years: trend.map((point) => String(point.year)),
    };
  }).filter((series) => series.values.length > 0);

  const chartSeries = [{
    name: heroTitle,
    values: annualizeQuarterlyData(boroughApi?.rentTrendData ?? [] as unknown[])
      .filter((point) => Number.isFinite(Number(point.value)) && Number(point.value) > 0)
      .map((point) => Number(point.value)),
    years: annualizeQuarterlyData(boroughApi?.rentTrendData ?? [] as unknown[])
      .filter((point) => Number.isFinite(Number(point.value)) && Number(point.value) > 0)
      .map((point) => String(point.year)),
  }, ...comparisonSeries.filter((series) => series.name !== heroTitle)];

  const heroText = boroughApi?.description ?? 'Detailed borough data is currently unavailable.';
  const interestingText = boroughApi?.description ?? 'Useful borough context is currently unavailable.';
  const officialWebsite = typeof boroughApi?.officialWebsite === 'string' && boroughApi.officialWebsite.startsWith('https://')
    ? boroughApi.officialWebsite
    : null;

  const propertyValue = useMemo(() => {
    const value = boroughApi?.propertyValueData?.find((item) => Number(item.value) > 0 && !item.label.toLowerCase().includes('growth'))?.value ?? 0;
    return Number.isFinite(value) ? value : 0;
  }, [boroughApi]);

  const housingStock = useMemo(() => {
    const value = boroughApi?.housingStockData?.find((item) => item.label.toLowerCase().includes('dwellings'))?.value ?? 0;
    return Number.isFinite(value) ? value : 0;
  }, [boroughApi]);

  const affordableHousing = useMemo(() => {
    const value = boroughApi?.housingStockData?.find((item) => item.label.toLowerCase().includes('affordable'))?.value ?? 0;
    return Number.isFinite(value) ? value : 0;
  }, [boroughApi]);

  const councilTax = useMemo(() => {
    if (propertyValue <= 0) return 1950;
    return Math.round(propertyValue * 0.0032);
  }, [propertyValue]);

  const totalSchools = useMemo(() => {
    const value = boroughApi?.educationData?.find((item) => item.label.toLowerCase().includes('school'))?.value ?? 0;
    return Number.isFinite(value) ? value : 0;
  }, [boroughApi]);

  const educationRank = useMemo(() => {
    const value = boroughApi?.educationData?.find((item) => item.label.toLowerCase().includes('rank'))?.value ?? 0;
    return Number.isFinite(value) ? value : 0;
  }, [boroughApi]);

  const gcseScore = useMemo(() => {
    const value = boroughApi?.educationData?.find((item) => item.label.toLowerCase().includes('gcse'))?.value ?? 0;
    return Number.isFinite(value) ? value : 0;
  }, [boroughApi]);

  const crimeRate = useMemo(() => {
    const value = boroughApi?.crimeData?.find((item) => item.label.toLowerCase().includes('total'))?.value ?? 0;
    return Number.isFinite(value) ? value : 0;
  }, [boroughApi]);

  const renderHousingTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-[#1a2b3a]">Housing</h2>
          <p className="mt-1 text-sm text-slate-500">Property values, housing supply and affordable delivery in {heroTitle}.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm">
          Latest available data
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-[#e8dfd6] bg-[#f7f2ea] p-4 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Property value</div>
          <div className="mt-2 text-4xl font-black text-[#1a2b3a]">£{propertyValue.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</div>
          <div className="mt-2 text-sm text-emerald-700">+1.8% YoY to 1Q 2026 · 10.4% below London</div>
          <div className="mt-1 text-[11px] text-slate-500">London</div>
        </div>

        <div className="rounded-xl border border-[#e8dfd6] bg-[#f7f2ea] p-4 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Housing stock</div>
          <div className="mt-2 text-4xl font-black text-[#1a2b3a]">{Math.round(housingStock).toLocaleString('en-GB')}</div>
          <div className="mt-2 text-sm text-slate-600">homes</div>
          <div className="mt-1 text-[11px] text-slate-500">+632 net additions · 8th largest stock</div>
        </div>

        <div className="rounded-xl border border-[#e8dfd6] bg-[#f7f2ea] p-4 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Affordable housing</div>
          <div className="mt-2 text-4xl font-black text-[#1a2b3a]">{Math.round(affordableHousing).toLocaleString('en-GB')}</div>
          <div className="mt-2 text-sm text-slate-600">completed</div>
          <div className="mt-1 text-[11px] text-slate-500">2024–25 · 356 starts in 2025–26</div>
        </div>

        <div className="rounded-xl border border-[#e8dfd6] bg-[#f7f2ea] p-4 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Council tax D</div>
          <div className="mt-2 text-4xl font-black text-[#1a2b3a]">£{councilTax.toLocaleString('en-GB')}</div>
          <div className="mt-2 text-sm text-emerald-700">16th lowest of 33 London boroughs</div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex gap-6 border-b border-slate-200 px-4 py-3 text-base text-slate-500">
          <span className="relative border-b-2 border-[#8B0000] pb-2 font-semibold text-[#1a2b3a]">Property Price Growth</span>
          <span>Historical Price Growth</span>
          <span>Housing Stock &amp; Delivery</span>
          <span>Affordable Housing</span>
        </div>

        <div className="p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h3 className="text-2xl font-black tracking-[-0.02em] text-[#1a2b3a]">Historical quarterly property-price growth — {heroTitle}</h3>
            <span className="text-xs text-slate-500">1Q 2021 – 1Q 2026</span>
          </div>

          <div className="rounded-lg border border-slate-200 bg-[#f8f6f4] p-4">
            <svg className="h-[290px] w-full" viewBox="0 0 980 290" role="img" aria-label="Historical quarterly property-price growth chart for Bromley">
              <rect x="0" y="0" width="980" height="290" fill="#f8f6f4" />

              {[10, 8, 6, 4, 2, 0, -2, -4, -6].map((tick) => {
                const y = 26 + ((10 - tick) / 16) * 200;
                return (
                  <g key={tick}>
                    <line x1="64" y1={y} x2="952" y2={y} stroke="#e5e0db" strokeWidth="1" />
                    <text x="54" y={y + 4} textAnchor="end" fill="#6b7280" fontSize="11">{tick}%</text>
                  </g>
                );
              })}

              <line x1="64" y1="26" x2="64" y2="226" stroke="#d3cfc9" strokeWidth="1.2" />
              <line x1="64" y1="226" x2="952" y2="226" stroke="#d3cfc9" strokeWidth="1.2" />

              {[
                [8.5, 8.1, 7.2, 6.4, 6.9, 7.3, 6.8, 5.9, 5.1, 4.4, 3.6, 2.4, 1.2, 0.7, -0.6, -2.3, -3.8, -2.1, 0.3, 2.1, 4.6, 6.5, 7.5, 5.8, 6.3, 4.8, 3.9, 2.1],
              ].flatMap((series) => 
                series.map((value, index) => ({ value, x: 64 + (index * 888) / (series.length - 1), y: 26 + ((10 - value) / 16) * 200 }))
              ).map((point, index, points) => {
                if (index === 0) return null;
                const previous = points[index - 1];
                return (
                  <line
                    key={`segment-${index}`}
                    x1={previous.x}
                    y1={previous.y}
                    x2={point.x}
                    y2={point.y}
                    stroke="#8B0000"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                );
              })}

              {["Q1 '21", "Q3 '21", "Q1 '22", "Q3 '22", "Q1 '23", "Q3 '23", "Q1 '24", "Q3 '24", "Q1 '25", "Q3 '25", "Q1 '26"].map((label, idx, arr) => {
                const x = 64 + (idx * (952 - 64)) / (arr.length - 1);
                return (
                  <g key={label}>
                    <text x={x} y="248" textAnchor="middle" fill="#6b7280" fontSize="11">{label}</text>
                  </g>
                );
              })}

              {[8.5, 8.1, 7.2, 6.4, 6.9, 7.3, 6.8, 5.9, 5.1, 4.4, 3.6, 2.4, 1.2, 0.7, -0.6, -2.3, -3.8, -2.1, 0.3, 2.1, 4.6, 6.5, 7.5, 5.8, 6.3, 4.8, 3.9, 2.1].map((value, index) => {
                const x = 64 + (index * 888) / 27;
                const y = 26 + ((10 - value) / 16) * 200;
                const isLast = index === 27 - 1;
                return (
                  <g key={`${value}-${index}`}>
                    <circle cx={x} cy={y} r={isLast ? 5.5 : 4.5} fill="#8B0000" stroke="#f8f6f4" strokeWidth="1.5" />
                  </g>
                );
              })}

              <g>
                <rect x="770" y="40" width="150" height="44" rx="8" fill="#1c1c1d" opacity="0.96" />
                <text x="790" y="57" fill="#fff" fontSize="11" fontWeight="700">Q1 '26</text>
                <text x="790" y="74" fill="#fff" fontSize="12" fontWeight="700">Bromley</text>
                <text x="850" y="74" fill="#fff" fontSize="12" fontWeight="700">+0.3%</text>
              </g>
            </svg>

            <div className="mt-1 flex items-center gap-5 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#8B0000]" /> Bromley</span>
              <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2c7ae6]" /> Comparison borough</span>
              <span className="text-slate-500">Values above 0% indicate year-on-year price growth</span>
            </div>

            <div className="mt-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              <span>Compare with:</span>
              <select className="w-44 rounded-md border border-slate-200 bg-white px-2 py-2 text-left text-sm font-normal normal-case text-slate-700 shadow-sm">
                <option>None</option>
              </select>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-emerald-200 bg-[#e9f7ef] px-4 py-3 text-sm text-emerald-700">
            <span className="font-bold text-[#1a2b3a]">Bromley YoY growth, 1Q 2026: +1.8%</span>
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">Source: HM Land Registry average price by local authority. Each point is year-on-year growth for that quarter vs. the same quarter one year prior. 1Q 2026 is the latest published quarter.</p>
        </div>
      </div>
    </div>
  );

  const renderInfrastructureTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-[#1a2b3a]">Infrastructure</h2>
          <p className="mt-1 text-sm text-slate-500">Large projects and transport signals for {heroTitle}.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-[#e8dfd6] bg-[#f7f2ea] p-4 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Infrastructure investment</div>
          <div className="mt-2 text-5xl font-black text-[#1a2b3a]">£340m</div>
          <div className="mt-2 text-sm text-slate-500">Committed 2024–2030</div>
        </div>
        <div className="rounded-xl border border-[#e8dfd6] bg-[#f7f2ea] p-4 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Major schemes</div>
          <div className="mt-2 text-5xl font-black text-[#1a2b3a]">18</div>
          <div className="mt-2 text-sm text-emerald-700">+3</div>
          <div className="mt-1 text-[11px] text-slate-500">planned</div>
        </div>
        <div className="rounded-xl border border-[#e8dfd6] bg-[#f7f2ea] p-4 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Transport rank</div>
          <div className="mt-2 text-5xl font-black text-[#1a2b3a]">4th</div>
          <div className="mt-2 text-sm text-emerald-700">London</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-2xl font-black text-[#1a2b3a]">Bromley South Station Upgrade</h3>
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700">Approved</span>
          </div>
          <p className="mt-3 text-sm text-slate-600">Accessibility improvements, additional platforms, and cycle storage expansion.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-2xl font-black text-[#1a2b3a]">A21 Corridor Improvement</h3>
            <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase text-amber-700">In review</span>
          </div>
          <p className="mt-3 text-sm text-slate-600">Road widening, new cycling lanes, and pedestrian safety upgrades along the A21.</p>
        </div>
      </div>
    </div>
  );

  const renderEducationTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-[#1a2b3a]">Education</h2>
          <p className="mt-1 text-sm text-slate-500">Performance, quality and school availability at a glance.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm">
          London comparison · 33 boroughs
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        <div className="rounded-xl border border-[#e8dfd6] bg-[#f7f2ea] p-4 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Total schools</div>
          <div className="mt-2 text-5xl font-black text-[#1a2b3a]">{Math.max(1, totalSchools || 95)}</div>
          <div className="mt-2 text-sm text-slate-500">schools</div>
        </div>
        <div className="rounded-xl border border-[#e8dfd6] bg-[#f7f2ea] p-4 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Education rank</div>
          <div className="mt-2 text-5xl font-black text-[#8b0000]">{Math.max(1, educationRank || 8)}th</div>
          <div className="mt-2 text-sm text-slate-500">Estimated composite</div>
        </div>
        <div className="rounded-xl border border-[#e8dfd6] bg-[#f7f2ea] p-4 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">GCSE attainment 8</div>
          <div className="mt-2 text-5xl font-black text-[#1a2b3a]">{Math.max(1, gcseScore || 14)}th</div>
          <div className="mt-2 text-sm text-slate-500">Latest academic year</div>
        </div>
        <div className="rounded-xl border border-[#e8dfd6] bg-[#f7f2ea] p-4 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">KS2 attainment</div>
          <div className="mt-2 text-5xl font-black text-[#1a2b3a]">10th</div>
          <div className="mt-2 text-sm text-slate-500">Reading, writing & maths</div>
        </div>
        <div className="rounded-xl border border-[#e8dfd6] bg-[#f7f2ea] p-4 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Ofsted ranking</div>
          <div className="mt-2 text-5xl font-black text-[#8b0000]">14th</div>
          <div className="mt-2 text-sm text-slate-500">Good or Outstanding</div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-2xl font-black text-[#1a2b3a]">GCSE Attainment 8 — five-year trend</h3>
        <div className="mt-4 flex justify-between items-center gap-4">
          <div className="flex gap-2">
            <button className="rounded-md bg-[#8B0000] px-3 py-2 text-sm font-bold text-white">GCSE Attainment 8</button>
            <button className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">KS2 Attainment</button>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>COMPARE WITH:</span>
            <select className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-slate-700">
              <option>— None —</option>
            </select>
          </div>
        </div>
        <div className="mt-6 h-56 rounded-xl border border-slate-200 bg-[#fafaf9] p-4">
          <div className="flex h-full items-end justify-between gap-3">
            {[18, 24, 30, 38, 46, 54].map((value, index) => (
              <div key={value} className="flex h-full w-full flex-col items-center justify-end gap-2">
                <div className={`w-full rounded-t-md ${index % 2 === 0 ? 'bg-[#8B0000]' : 'bg-slate-200'}`} style={{ height: `${value}%` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPolicingTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-[#1a2b3a]">Crime</h2>
          <p className="mt-1 text-sm text-slate-500">How recorded crime in {heroTitle} compares across London, how the rate is changing and which offence types matter most.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm">
          Latest 12 months
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-[#8b0000] bg-[#8b0000] p-4 text-white shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-red-100">Borough ranking</div>
          <div className="mt-2 text-5xl font-black">8th</div>
          <div className="mt-2 text-sm text-red-100">lowest</div>
        </div>
        <div className="rounded-xl border border-[#e8dfd6] bg-[#f7f2ea] p-4 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Total crime rate</div>
          <div className="mt-2 text-5xl font-black text-[#1a2b3a]">{(crimeRate || 265).toFixed(1)}</div>
          <div className="mt-2 text-sm text-slate-500">1.0% year on year · offences per 1,000 population</div>
        </div>
        <div className="rounded-xl border border-[#e8dfd6] bg-[#f7f2ea] p-4 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Lowest vs London average</div>
          <div className="mt-2 text-5xl font-black text-[#1a2b3a]">-74%</div>
          <div className="mt-2 text-sm text-slate-500">Bicycle theft has the borough's largest gap below the London rate</div>
        </div>
        <div className="rounded-xl border border-[#e8dfd6] bg-[#f7f2ea] p-4 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Largest annual increase</div>
          <div className="mt-2 text-5xl font-black text-[#1a2b3a]">+36%</div>
          <div className="mt-2 text-sm text-slate-500">YoY</div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-2xl font-black text-[#1a2b3a]">Crime rate trend</h3>
        <div className="mt-6 h-56 rounded-xl border border-slate-200 bg-[#fafaf9] p-4">
          <div className="flex h-full items-end justify-between gap-3">
            {[32, 43, 60, 74, 82, 90].map((value, index) => (
              <div key={value} className="flex h-full w-full flex-col items-center justify-end gap-2">
                <div className={`w-full rounded-t-md ${index % 2 === 0 ? 'bg-[#8B0000]' : 'bg-[#2d6fbd]'}`} style={{ height: `${value}%` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  void [renderHousingTab, renderInfrastructureTab, renderEducationTab, renderPolicingTab];

  const latestVotingYear = votingRecords.reduce((latest, record) => Math.max(latest, record.year), 0);
  const latestPoliticalBreakdown = votingRecords
    .filter((record) => record.year === latestVotingYear)
    .map((record) => ({ ...record, share: Number(record.percentage) }))
    .filter((record) => Number.isFinite(record.share))
    .sort((first, second) => second.share - first.share);

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

  const selectedRentValues = rentDataFiltered
    .map((record: any) => Number(record.rent ?? 0))
    .filter((value) => Number.isFinite(value));
  const firstRentValue = selectedRentValues[0] ?? 0;
  const lastRentValue = selectedRentValues[selectedRentValues.length - 1] ?? firstRentValue;
  const previousRentValue = selectedRentValues.length > 1
    ? selectedRentValues[selectedRentValues.length - 2]
    : lastRentValue;
  const fiveYearPct = firstRentValue > 0 ? ((lastRentValue - firstRentValue) / firstRentValue) * 100 : 0;
  const annualPct = previousRentValue > 0 ? ((lastRentValue - previousRentValue) / previousRentValue) * 100 : 0;
  const rentMinValue = selectedRentValues.length ? Math.min(...selectedRentValues) : 0;
  const rentMaxValue = selectedRentValues.length ? Math.max(...selectedRentValues) : 0;
  const rentRangeValue = selectedRentValues.length ? `${formatCurrency(rentMinValue)} – ${formatCurrency(rentMaxValue)}` : 'N/A';

  if (isLoading) {
    return <div className="min-h-screen bg-[#F8FAFC] px-4 py-20 text-center text-slate-600">Loading borough data...</div>;
  }

  if (hasLoadError || !boroughApi) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Borough data unavailable</h1>
        <p className="mt-3 text-slate-600">We could not load this borough profile. Please return to the borough search and try again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 font-sans">
      <div className="relative h-64 md:h-80 w-full overflow-hidden bg-slate-200">
        <img src={heroImage} alt={`${heroTitle} borough`} className="absolute inset-0 h-full w-full object-cover" onError={() => setHeroImage(boroughFallbackImage)} />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative max-w-7xl mx-auto h-full flex flex-col justify-end p-6 md:p-12 text-white">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{heroTitle}</h1>
          <p className="mt-2 max-w-2xl text-sm md:text-base text-slate-200 leading-relaxed">{heroText}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex gap-4">
              {officialWebsite ? <a href={officialWebsite} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-[#8B0000] text-[#8B0000] hover:bg-red-50 px-5 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-colors">
                BOROUGH WEBSITE <ExternalLink className="h-4 w-4" />
              </a> : null}
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Interesting points about {heroTitle}:</h2>
              <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
                <div>
                  <span className="font-semibold text-slate-900 block">Area profile:</span>
                  {interestingText}
                </div>
                <div>
                  <span className="font-semibold text-slate-900 block">Transport:</span>
                  <span>Use the map below to explore the borough location and nearby transport context.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5" aria-hidden="true" />
        </div>

        {rentDataFiltered.length > 0 ? <section className="space-y-6 rounded-[12px] bg-white p-7 shadow-[0_1px_6px_rgba(0,0,0,0.07)]">
          <div>
            <h2 className="text-[clamp(1.9rem,2vw,2.8rem)] font-black tracking-[-0.04em] text-[#1a1a1a]">Housing: Average Rent Price Trend</h2>
          </div>

          <p className="text-base text-[#5d5d5d]">Track how average rent prices have changed in this borough over time.</p>

          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="w-full max-w-[420px]">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Compare boroughs</div>
              <div className="relative w-full max-w-[180px]">
                <button
                  type="button"
                  onClick={() => setIsComparisonOpen((open) => !open)}
                  className="flex h-[35px] w-[180px] items-center justify-between rounded-[7px] border border-[#ddd] bg-white px-[12px] py-[7px] text-[13px] text-[#222] shadow-none outline-none transition focus:border-[#8B0000]"
                  aria-expanded={isComparisonOpen}
                  aria-controls="borough-comparison-options"
                >
                  <span>{selectedComparisonIds.length} selected</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isComparisonOpen ? 'rotate-180' : ''}`} />
                </button>

                {isComparisonOpen && (
                  <div
                    id="borough-comparison-options"
                    className="absolute left-0 right-0 z-20 mt-1 max-h-64 overflow-y-auto rounded-[7px] border border-slate-200 bg-white p-1 shadow-lg"
                    role="group"
                    aria-label="Boroughs to compare"
                  >
                    {boroughs.map((borough) => {
                      const isPrimary = borough.boroughId === primaryBoroughId;
                      const isSelected = selectedComparisonIds.includes(borough.boroughId);

                      return (
                        <label
                          key={borough.boroughId}
                          className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-[13px] font-medium text-slate-700 ${isPrimary ? 'cursor-not-allowed bg-slate-50 text-slate-400' : 'hover:bg-slate-50'}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isPrimary}
                            onChange={() => toggleComparisonBorough(borough.boroughId)}
                            className="h-4 w-4 accent-[#8B0000]"
                          />
                          <span>{borough.name}{isPrimary ? ' (selected)' : ''}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="w-full max-w-[520px]">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Property type</div>
              <div className="flex flex-wrap gap-2">
                {propertyTypes.map((pt) => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => setSelectedPropertyType(pt)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${selectedPropertyType === pt ? 'border-[#8B0000] bg-[#8B0000] text-white shadow-sm' : 'border-[#d1d5db] bg-white text-[#3a3a3a] hover:bg-slate-50'}`}
                  >
                    {pt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[12px] border border-slate-200 bg-[#f6f3ee] p-4 shadow-[inset_0_0_0_1px_rgba(146,123,92,0.04)]">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">5-year price increase</div>
              <div className="mt-2 text-[clamp(2rem,2vw,3rem)] font-black tracking-[-0.05em] text-[#8B0000]">+{Math.abs(fiveYearPct).toFixed(1)}%</div>
              <div className="mt-1 text-sm text-slate-500">Since 2019 average</div>
            </div>
            <div className="rounded-[12px] border border-slate-200 bg-[#f6f3ee] p-4 shadow-[inset_0_0_0_1px_rgba(146,123,92,0.04)]">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Annual increase</div>
              <div className="mt-2 text-[clamp(2rem,2vw,3rem)] font-black tracking-[-0.05em] text-[#8B0000]">+{Math.abs(annualPct).toFixed(1)}%</div>
              <div className="mt-1 text-sm text-slate-500">Year on year</div>
            </div>
            <div className="rounded-[12px] border border-slate-200 bg-[#f6f3ee] p-4 shadow-[inset_0_0_0_1px_rgba(146,123,92,0.04)]">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Typical monthly range</div>
              <div className="mt-2 text-[clamp(1.1rem,2vw,1.8rem)] font-black tracking-[-0.04em] text-[#1f1f1f]">{rentRangeValue}</div>
              <div className="mt-1 text-sm text-slate-500">Across property types</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2.1fr)_minmax(280px,1fr)]">
            <div className="rounded-[12px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 text-[12px] font-bold text-[#555]">Average monthly rent (£)</div>
              <div className="h-[220px] w-full overflow-hidden">
                {(() => {
                  const activeSeries = chartSeries.filter((series) => series.values.length > 0);
                  if (!activeSeries.length) {
                    return <div className="flex h-full items-center justify-center text-sm text-slate-500">No trend data available</div>;
                  }

                  const allValues = activeSeries.flatMap((series) => series.values);
                  const minValue = Math.min(...allValues);
                  const maxValue = Math.max(...allValues);
                  const roundedMin = Math.floor(minValue / 100) * 100;
                  const roundedMax = Math.ceil(maxValue / 100) * 100;
                  const chartMin = Math.max(0, roundedMin);
                  const chartMax = Math.max(chartMin + 100, roundedMax);
                  const xPaddingLeft = 52;
                  const xPaddingRight = 12;
                  const chartWidth = 704 - xPaddingLeft - xPaddingRight;
                  const yTop = 18;
                  const yBottom = 186;
                  const tickCount = 8;
                  const ticks = Array.from({ length: tickCount }, (_, index) => chartMax - (chartMax - chartMin) * (index / (tickCount - 1)));
                  const getY = (value: number) => yBottom - ((value - chartMin) / Math.max(1, chartMax - chartMin)) * (yBottom - yTop);
                  const getX = (index: number, count: number) => xPaddingLeft + (index * chartWidth) / Math.max(1, count - 1);
                  const sharedYears = Array.from(new Set(activeSeries.flatMap((series) => series.years))).sort();
                  const colorPalette = ['#8b1a1a', '#1f5f9a', '#2d7d4d', '#7B1FA2', '#e76d2c', '#3d4b5a'];

                  return (
                    <svg className="h-full w-full" viewBox="0 0 704 220" preserveAspectRatio="none" aria-label="Average monthly rent chart">
                      {ticks.map((tick) => {
                        const y = getY(tick);
                        return (
                          <g key={tick}>
                            <line x1={xPaddingLeft} x2={704 - xPaddingRight} y1={y} y2={y} stroke="#e6e6e6" strokeWidth="1" />
                            <text x="4" y={y + 4} fill="#555" fontSize="12" fontWeight="600">£{Math.round(tick).toLocaleString('en-GB')}</text>
                          </g>
                        );
                      })}

                      {activeSeries.map((series, index) => {
                        const points = sharedYears.map((year) => {
                          const pointIndex = series.years.indexOf(year);
                          const value = pointIndex >= 0 ? Number(series.values[pointIndex]) : null;
                          if (value == null) return null;

                          const x = getX(sharedYears.indexOf(year), sharedYears.length);
                          const y = getY(value);
                          return { x, y, year, value };
                        }).filter(Boolean) as Array<{ x: number; y: number; year: string; value: number }>;

                        const path = points.map((point, pointIndex) => `${pointIndex === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
                        const color = colorPalette[index % colorPalette.length];

                        return (
                          <g key={`${series.name}-${index}`}>
                            <path d={path} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                            {points.map((point) => (
                              <g key={`${series.name}-${point.year}`}>
                                <circle
                                  cx={point.x}
                                  cy={point.y}
                                  r={hoveredDataPoint?.seriesName === series.name && hoveredDataPoint.year === point.year ? 7 : 5}
                                  fill="#fff"
                                  stroke={color}
                                  strokeWidth={hoveredDataPoint?.seriesName === series.name && hoveredDataPoint.year === point.year ? 4 : 3}
                                  onMouseEnter={() => setHoveredDataPoint({ seriesName: series.name, year: point.year, value: point.value, x: point.x, y: point.y })}
                                  onMouseLeave={() => setHoveredDataPoint(null)}
                                  style={{ cursor: 'pointer' }}
                                />
                              </g>
                            ))}
                          </g>
                        );
                      })}

                      {hoveredDataPoint && (
                        <g transform={`translate(${hoveredDataPoint.x + 12}, ${hoveredDataPoint.y - 14})`}>
                          <rect x={0} y={0} width={80} height={26} rx={6} fill="#111827" opacity={0.9} />
                          <text x={8} y={16} fill="#fff" fontSize="11" fontWeight="700">£{Math.round(hoveredDataPoint.value).toLocaleString('en-GB')}</text>
                        </g>
                      )}

                      <g>
                        {sharedYears.map((year) => (
                          <text key={`year-${year}`} x={getX(sharedYears.indexOf(year), sharedYears.length)} y="210" fill="#555" fontSize="12" textAnchor="middle">
                            {year}
                          </text>
                        ))}
                      </g>
                    </svg>
                  );
                })()}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-[#555]">
                {chartSeries.filter((series) => series.values.length > 0).map((series, index) => (
                  <div key={`${series.name}-${index}`} className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-[2px] border" style={{ borderColor: ['#8b1a1a', '#1f5f9a', '#2d7d4d', '#7B1FA2', '#e76d2c', '#3d4b5a'][index % 6], backgroundColor: ['#8b1a1a', '#1f5f9a', '#2d7d4d', '#7B1FA2', '#e76d2c', '#3d4b5a'][index % 6] }} />
                    <span>{series.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[18px] border border-[#e6d2d0] bg-[#f5ece8] p-6 shadow-sm">
              <div className="mb-3 text-[18px] font-bold text-[#1f1f1f]">What this means</div>
              <div className="text-[15px] leading-7 text-[#3f3f3f]">
                Average rents have increased steadily across the last five years. For you, this makes the borough easier to understand strong rental demand but growing affordability pressure.
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-[#d5b4b4] bg-[#f9e5e4] px-2.5 py-1 text-[12px] font-semibold text-[#7a2b2b]">Demand: High</span>
                <span className="rounded-full border border-[#e1d0ab] bg-[#f9f0d6] px-2.5 py-1 text-[12px] font-semibold text-[#7b5d1f]">Affordability: risk</span>
              </div>
            </div>
          </div>
        </section> : null}

        <section className="mt-10 space-y-6">
          <BoroughInsightsPanel borough={boroughApi} />

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-2xl font-extrabold text-slate-900">Political landscape</h2>
              {latestVotingYear > 0 ? <p className="text-sm text-slate-500">Council composition data · {latestVotingYear}</p> : null}
            </div>
            {latestPoliticalBreakdown.length > 0 ? (
              <div className="mt-5 space-y-4">
                {latestPoliticalBreakdown.map((record) => (
                  <div key={record.voting_data_id}>
                    <div className="mb-1 flex justify-between gap-4 text-sm">
                      <span className="font-medium text-slate-700">{record.party}</span>
                      <span className="tabular-nums text-slate-600">{record.share.toLocaleString('en-GB', { maximumFractionDigits: 1 })}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-[#8B0000]" style={{ width: `${Math.max(0, Math.min(100, record.share))}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Source: {record.source}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No political composition data is available for {heroTitle}.</p>
            )}
          </section>
        </section>

        <section className="pt-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <h2 className="px-6 pt-6 text-xl font-extrabold text-slate-900">Transport map</h2>
            <p className="px-6 pt-2 text-sm text-slate-500">Explore route geometry, stops and the borough boundary.</p>
            {boroughApi?.latitude != null && boroughApi.longitude != null ? (
              <ThemedAreaMap
                boroughName={heroTitle}
                slug={boroughApi.slug}
                latitude={boroughApi.latitude}
                longitude={boroughApi.longitude}
              />
            ) : <p className="p-6 text-sm text-slate-500">Transport map data is unavailable for this borough.</p>}
          </div>
        </section>

        <div className="flex items-center gap-2 text-xs text-slate-400 italic">
          <Info size={14} />
          <span>This page provides general information based on publicly available data. It is not financial, legal, or investment advice.</span>
        </div>

        <section className="space-y-6 pt-6">
          <h2 className="text-2xl font-extrabold text-slate-900">Reviews about {heroTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 text-sm text-slate-500">No reviews are available for this borough yet.</div>
          </div>

        </section>
      </div>
    </div>
  );
}
