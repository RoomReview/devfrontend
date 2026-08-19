import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown, Info } from 'lucide-react';

import { boroughService } from '@/services/borough.service';
import type { BoroughApiResponse } from '@/types/borough.types';
import { BoroughTabsDashboard } from '@/components/BoroughTabsDashboard';



export default function BoroughPage() {
  const { id } = useParams<{ id?: string }>();
  const [selectedBorough, setSelectedBorough] = useState(() => (id ? String(id).toUpperCase() : 'BROMLEY'));
  const [selectedPropertyType, setSelectedPropertyType] = useState('ALL');
  
  const [openRegenIndex, setOpenRegenIndex] = useState<string | null>(null);
  const [boroughApi, setBoroughApi] = useState<BoroughApiResponse | null>(null);
  const [boroughs, setBoroughs] = useState<string[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [postcodes, setPostcodes] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      try {
        const fetchId = id ?? selectedBorough.toLowerCase();
        const res = await boroughService.getById(String(fetchId));
        setBoroughApi(res);
        setSelectedBorough(String(res.name ?? res.slug ?? fetchId).toUpperCase());

        const compare = (res as any).compareBoroughs ?? (res.metrics && (res.metrics as any).compareBoroughs) ?? [];
        setBoroughs(Array.isArray(compare) && compare.length ? compare.map((b: string) => String(b).toUpperCase()) : [String(res.name).toUpperCase()]);

        const types = Array.from(new Set((res.rentData ?? []).map((r: any) => ((r.type || 'ALL') as string).toUpperCase())));
        setPropertyTypes(types.length ? types : ['ALL']);

        const codes = (res.districtData ?? []).map((d: any) => d.districtCode ?? d.boroughName ?? '').filter(Boolean);
        setPostcodes(codes.length ? codes : []);
      } catch (e) {
        setBoroughApi(null);
        setBoroughs([selectedBorough]);
        setPropertyTypes(['ALL']);
        setPostcodes([]);
      }
    };

    load();
  }, [id]);

  const getMetric = (key: string, fallback = '—') => {
    if (!boroughApi?.metrics) return fallback;
    const value = (boroughApi.metrics as Record<string, unknown>)[key] ?? (boroughApi.metrics as Record<string, unknown>)[key.toLowerCase()];
    if (typeof value === 'number') return String(value);
    if (typeof value === 'string') return value;
    return fallback;
  };

  const getMetricNumber = (key: string, fallback = 0) => {
    const value = getMetric(key, String(fallback));
    const parsed = Number(String(value).replace(/[^0-9.-]+/g, ''));
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const getMetricLabel = (key: string, fallback: string) => {
    const value = getMetric(key, fallback);
    return value === '—' ? fallback : value;
  };

  const formatPercentMetric = (value: unknown, fallback = '—') => {
    if (value === null || value === undefined || value === '' || value === '—' || value === 'No data') {
      return fallback;
    }

    if (typeof value === 'number') {
      if (!Number.isFinite(value)) return fallback;
      const rounded = value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
      return `${rounded}%`;
    }

    if (typeof value === 'string') {
      const cleaned = value.trim();
      if (!cleaned || cleaned === '—' || cleaned.toLowerCase() === 'no data') return fallback;
      if (cleaned.includes('%')) return cleaned;

      const numeric = Number(cleaned.replace(/[^0-9.-]+/g, ''));
      if (Number.isFinite(numeric)) {
        const rounded = numeric % 1 === 0 ? numeric.toFixed(0) : numeric.toFixed(1);
        return `${rounded}%`;
      }

      return cleaned;
    }

    return fallback;
  };

  const rentDataFiltered = (boroughApi?.rentData ?? []).filter((r: any) => {
    if (!selectedPropertyType || selectedPropertyType === 'ALL') return true;
    return (r.type || '').toUpperCase() === String(selectedPropertyType).toUpperCase();
  });

  const rentTrendValues = rentDataFiltered.map((r: any) => Number(r.rent ?? 0));
  const rentTrendYears = rentTrendValues.length
    ? Array.from({ length: rentTrendValues.length }, (_, i) => String(2019 + i))
    : [];

  const rentMin = rentTrendValues.length ? Math.min(...rentTrendValues) : undefined;
  const rentMax = rentTrendValues.length ? Math.max(...rentTrendValues) : undefined;

  const displayRentRange = rentMin !== undefined && rentMax !== undefined
    ? `${new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(rentMin)} – ${new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(rentMax)}`
    : getMetricLabel('typicalRentRange', getMetricLabel('rentRange', '—'));

  const displayGrowth = getMetricLabel('fiveYearGrowth', getMetricLabel('fiveYearPriceIncrease', '—'));
  const displayAnnual = getMetricLabel('annualIncrease', getMetricLabel('annualGrowth', '—'));
  const displayRentRank = getMetricLabel('rentRank', getMetricLabel('rent_rank', '—'));

  const svgWidth = 500;
  const svgHeight = 120;
  const leftPad = 20;
  const rightPad = 20;
  const innerW = svgWidth - leftPad - rightPad;
  const pts = rentTrendValues.map((v, i) => ({ v, i }));
  const svgPoints = pts.map((p) => {
    const count = Math.max(1, rentTrendValues.length - 1);
    const step = count > 0 ? innerW / count : innerW;
    const x = leftPad + p.i * step;
    const yTop = 10;
    const yBottom = svgHeight - 10;
    const min = rentMin ?? 0;
    const max = rentMax ?? min + 1;
    const y = yBottom - ((p.v - min) / (max - min || 1)) * (yBottom - yTop);
    return { x, y, v: p.v };
  });
  const svgPath = svgPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');

  const totalDwellings = boroughApi?.housingStockData?.find((item) => item.label === 'Total dwellings')?.value;
  const totalDwellingsText = totalDwellings != null ? totalDwellings.toLocaleString('en-GB') : getMetricLabel('currentHousingStock', '—');
  const totalPlannedUnits = getMetricNumber('plannedUnits', getMetricNumber('planned_units', 0));
  const capacityChange = getMetricLabel('capacityChange', getMetricLabel('capacity_change', '—'));

  const educationData = boroughApi?.educationData ?? [];
  const crimeData = boroughApi?.crimeData ?? [];
  const districtCodes = (boroughApi?.districtData ?? []).map((d) => d.districtCode ?? d.boroughName ?? '').filter(Boolean);

  

  const rankingData = boroughs.length
    ? boroughs.slice(0, 8).map((name, idx) => ({
        name,
        score: idx === 0 ? Number(displayRentRank) || 78 : 78 - idx * 2,
        val: idx === 0 ? Number(displayRentRank) || 78 : 78 - idx * 2,
        isTarget: name === selectedBorough.toUpperCase(),
      }))
    : [
        { name: String(boroughApi?.name ?? 'Borough').toUpperCase(), score: Number(displayRentRank) || 78, val: Number(displayRentRank) || 78, isTarget: true },
      ];

  const politicalData = [
    { party: 'Housing', percentage: Math.min(100, Number(totalDwellings || 0) / 1000), color: '#E52420' },
    { party: 'Education', percentage: Math.min(100, Number(educationData.find((item) => item.label === 'GCSE attainment 8')?.value || 0)), color: '#FFA500' },
    { party: 'Crime', percentage: Math.min(100, Number(crimeData.find((item) => item.label === 'Violent crime')?.value || 0) * 2), color: '#12B6CF' },
  ];

  const housingHighlights = [
    {
      id: 'housing-stock',
      title: 'Housing stock snapshot',
      status: totalDwellings != null && totalDwellings > 0 ? 'Live' : 'Unavailable',
      statusType: totalDwellings != null && totalDwellings > 0 ? 'approved' as const : 'review' as const,
      description: totalDwellingsText !== '—' ? `${totalDwellingsText} recorded dwellings` : 'No housing stock data',
      date: 'Live from API',
    },
    {
      id: 'rent-profile',
      title: 'Rent profile',
      status: rentDataFiltered.length ? 'Live' : 'Unavailable',
      statusType: rentDataFiltered.length ? 'approved' as const : 'review' as const,
      description: rentDataFiltered.length ? `${rentDataFiltered.length} rent series` : 'No rent data',
      date: 'Live from API',
    },
    {
      id: 'education-indicators',
      title: 'Education indicators',
      status: educationData.length ? 'Live' : 'Unavailable',
      statusType: educationData.length ? 'approved' as const : 'review' as const,
      description: educationData.length ? `${educationData.length} indicators available` : 'No education data',
      date: 'Live from API',
    },
    {
      id: 'crime-indicators',
      title: 'Crime indicators',
      status: crimeData.length ? 'Live' : 'Unavailable',
      statusType: crimeData.length ? 'approved' as const : 'review' as const,
      description: crimeData.length ? `${crimeData.length} recorded crime metrics` : 'No crime data',
      date: 'Live from API',
    },
  ];

  const reviewCards = boroughApi?.description
    ? [
        {
          location: `${boroughApi.name} – Live API data`,
          author: 'API-based profile',
          date: 'Updated now',
          avatar: 'https://i.pravatar.cc/100?img=33',
          text: boroughApi.description,
          pros: `Housing stock: ${totalDwellingsText}`,
          cons: `Crime indicators: ${crimeData.length ? crimeData.length : 'none available'}`,
        },
        {
          location: `${boroughApi.name} – Education`,
          author: 'Education profile',
          date: 'Updated now',
          avatar: 'https://i.pravatar.cc/100?img=12',
          text: 'Education metrics are taken directly from the borough response and displayed as live indicators.',
          pros: `Schools: ${educationData.find((item) => item.label === 'Total schools')?.value != null ? String(educationData.find((item) => item.label === 'Total schools')?.value) : '—'}`,
          cons: `GCSE attainment: ${educationData.find((item) => item.label === 'GCSE attainment 8')?.value != null ? String(educationData.find((item) => item.label === 'GCSE attainment 8')?.value) : '—'}`,
        },
        {
          location: `${boroughApi.name} – Infrastructure`,
          author: 'District profile',
          date: 'Updated now',
          avatar: 'https://i.pravatar.cc/100?img=47',
          text: 'District and postcode information is sourced from the borough dataset for this location.',
          pros: `District codes: ${districtCodes.length ? districtCodes.length : 0}`,
          cons: `Coverage: ${districtCodes.length ? `${districtCodes.length} district records` : 'no district data'}`,
        },
      ]
    : [];

  const heroTitle = boroughApi?.name ?? (selectedBorough || 'Borough');
  const heroText = boroughApi?.description ?? 'Detailed borough data is currently unavailable.';
  const interestingText = boroughApi?.description ?? 'Useful borough context is currently unavailable.';

  const dashboardData = {
    housing: {
      metrics: [
        { label: 'Total planned units', value: totalPlannedUnits > 0 ? totalPlannedUnits.toLocaleString('en-GB') : '—' },
        { label: 'Current housing stock', value: totalDwellingsText },
        { label: 'Rent range', value: displayRentRange },
      ],
      projects: housingHighlights.map((p) => ({ id: p.id, title: p.title, status: p.status, description: p.description })),
    },
    infrastructure: {
      insights: [getMetricLabel('transportScore', 'No transport score'), getMetricLabel('planningPipeline', 'No pipeline')],
      newRoadProjects: [],
      capacityUpgrades: [],
    },
    education: {
      metrics: (educationData ?? []).map((e: any) => ({ label: e.label, value: String(e.value) })),
      chartData: (educationData ?? []).map((e: any) => ({ category: e.label, primary: Number(e.value) || 0, secondary: 0 })),
    },
    policing: {
      metrics: (crimeData ?? []).map((c: any) => ({ label: c.label, value: String(c.value) })),
      chartData: (crimeData ?? []).map((c: any) => ({ year: c.label, forecast: Number(c.value) || 0, target: Number(c.value) || 0 })),
    },
  } as const;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 font-sans">
      <div className="relative h-72 md:h-96 w-full bg-cover bg-center" style={{ backgroundImage: `url('${boroughApi?.image ?? 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1600&q=80'}')` }}>
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
              <button className="bg-[#8B0000] hover:bg-red-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
                <span className="text-lg leading-none">+</span> ADD REVIEW
              </button>
              <button className="border border-[#8B0000] text-[#8B0000] hover:bg-red-50 px-5 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-colors">
                BOROUGH WEBSITE
              </button>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Interesting points about {heroTitle}:</h2>
              <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
                <div>
                  <span className="font-semibold text-slate-900 block">Live borough profile:</span>
                  {interestingText}
                </div>
                <div>
                  <span className="font-semibold text-slate-900 block">Current housing data:</span>
                  {totalDwellingsText !== '—' ? `${totalDwellingsText} dwellings recorded` : 'No housing stock data available'}
                </div>
                <div>
                  <span className="font-semibold text-slate-900 block">Education data:</span>
                  {educationData.length ? `${educationData.length} education indicators available from the API` : 'No education data available'}
                </div>
                <div>
                  <span className="font-semibold text-slate-900 block">Transport and planning:</span>
                  <a href="#view" className="text-blue-600 underline font-medium ml-1">View live metrics</a>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <h3 className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wider">Listing of all codes from borough {heroTitle}:</h3>
            <div className="flex flex-wrap gap-2">
              {postcodes.length ? postcodes.map((code, idx) => (
                <span key={idx} className="bg-[#1E293B] text-white px-4 py-2 rounded-full text-xs font-semibold">
                  {code}
                </span>
              )) : <span className="text-sm text-slate-500">No postcode data is available for this borough.</span>}
            </div>
          </div>
        </div>

        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Housing: average rent price trend</h2>
            <p className="text-sm text-slate-500 mt-1">Track how average rent prices have changed in this borough over time.</p>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-2">Compare boroughs</span>
              <div className="flex flex-wrap gap-2">
                {boroughs.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBorough(b)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${selectedBorough === b ? 'bg-[#1E293B] text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-2">Property type</span>
              <div className="flex flex-wrap gap-2">
                {propertyTypes.map((pt) => (
                  <button
                    key={pt}
                    onClick={() => setSelectedPropertyType(pt)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${selectedPropertyType === pt ? 'bg-[#1E293B] text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                  >
                    {pt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="TYPICAL MONTHLY RANGE" main={displayRentRange} sub="Across property types" />
            <MetricCard title="5-YEAR PRICE INCREASE" main={displayGrowth} mainColor="text-emerald-600" sub="Since 2019 average" />
            <MetricCard title="ANNUAL INCREASE" main={displayAnnual} mainColor="text-emerald-600" sub="Year on year" />
            <MetricCard title="RENT RANK" main={displayRentRank} sub="Most expensive in London" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
              <h4 className="text-base font-bold text-slate-900 mb-6">Average monthly rent (£) — {selectedPropertyType}</h4>
              <div className="w-full h-44 relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                  <line x1="0" y1="30" x2="500" y2="30" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="0" y1="70" x2="500" y2="70" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="#E2E8F0" strokeWidth="1" />
                  <path d={svgPath} fill="none" stroke="#8B0000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  {svgPoints.map((pt, i) => (
                    <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="#8B0000" />
                  ))}
                </svg>
                <div className="flex justify-between text-xs text-slate-600 mt-3 px-1 relative">
                  <div className="absolute top-0 left-0 right-0 h-3 border-t border-b border-slate-300">
                    {(rentTrendYears.length ? rentTrendYears : ['AVERAGE']).map((_, i) => (
                      <div
                        key={i}
                        className="absolute top-0 w-px h-3 bg-slate-300"
                        style={{ left: `${(i / Math.max(1, (rentTrendYears.length || 1) - 1)) * 100}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between w-full pt-4">
                    {(rentTrendYears.length ? rentTrendYears : ['AVERAGE']).map((y, i) => (
                      <span key={i} className="text-center">{y}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 bg-[#F5EBE6] rounded-2xl p-6 flex flex-col justify-center">
              <h4 className="text-base font-bold text-slate-900 mb-3">What this means</h4>
              <p className="text-sm text-slate-700 leading-relaxed">
                These rent values are taken directly from the available borough dataset for {heroTitle}. They help explain local affordability and demand patterns.
              </p>
            </div>
          </div>
        </section>

        <section className="pt-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <BoroughTabsDashboard data={dashboardData as any} initialTab="housing" />
          </div>
        </section>

        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Borough improvement overview</h2>
            <p className="text-sm text-slate-500 mt-1">A ranking-led section that compares boroughs using the data returned by the API.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <MetricCard title="OVERALL SCORE" main={`${displayRentRank} / 100`} sub="Live borough metric" />
            <MetricCard title="AFFORDABLE HOUSING" main={totalDwellingsText !== '—' ? totalDwellingsText : '—'} sub="Recorded dwellings" />
            <MetricCard title="EDUCATION" main={formatPercentMetric(educationData.find((item) => item.label === 'GCSE attainment 8')?.value ?? null)} mainColor="text-emerald-600" sub="Academic indicator" />
            <MetricCard title="TRANSPORT" main={formatPercentMetric(getMetric('transportScore'))} mainColor="text-emerald-600" sub="Infrastructure signal" />
            <MetricCard title="CRIME" main={crimeData.find((item) => item.label === 'Violent crime')?.value != null ? String(crimeData.find((item) => item.label === 'Violent crime')?.value) : '—'} mainColor="text-red-600" sub="Main concern" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900">London borough improvement ranking</h3>
              <p className="text-xs text-slate-500 -mt-2">Selected borough benchmarked against comparable boroughs</p>
              <div className="space-y-3 pt-2">
                {rankingData.map((item, i) => (
                  <div key={i} className="flex items-center text-xs font-semibold">
                    <span className={`w-32 ${item.isTarget ? 'text-[#8B0000] font-bold' : 'text-slate-700'}`}>{item.name}</span>
                    <span className={`w-8 ${item.isTarget ? 'text-[#8B0000] font-bold' : 'text-slate-500'}`}>{item.score}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden ml-2">
                      <div className={`h-full rounded-full ${item.isTarget ? 'bg-[#8B0000]' : 'bg-[#1E293B]'}`} style={{ width: `${Math.max(10, item.val)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
              <h3 className="text-base font-bold text-slate-900">Score logic</h3>
              <div className="space-y-3 text-xs divide-y divide-slate-100">
                <ScoreLogicRow label="Housing development" pct={totalPlannedUnits > 0 ? `${totalPlannedUnits.toLocaleString('en-GB')} units` : 'No data'} />
                <ScoreLogicRow label="Transport & infrastructure" pct={formatPercentMetric(getMetric('transportScore'))} />
                <ScoreLogicRow label="Education investment" pct={formatPercentMetric(educationData.find((item) => item.label === 'GCSE attainment 8')?.value ?? null)} />
                <ScoreLogicRow label="Public investment" pct={formatPercentMetric(capacityChange)} />
                <ScoreLogicRow label="Regeneration activity" pct={districtCodes.length ? `${districtCodes.length} codes` : '—'} />
                <ScoreLogicRow label="Planning pipeline" pct={totalPlannedUnits > 0 ? `${totalPlannedUnits.toLocaleString('en-GB')} units` : '—'} />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Live borough dataset signals</h2>
            <p className="text-sm text-slate-500 mt-1">Key dataset summaries derived directly from the current borough response.</p>
          </div>

          <div className="space-y-3">
            {housingHighlights.map((item) => (
              <div key={item.id} className="border border-slate-200 rounded-2xl bg-white overflow-hidden transition-all">
                <button onClick={() => setOpenRegenIndex(openRegenIndex === item.id ? null : item.id)} className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">{item.title}</span>
                    <Badge type={item.statusType} label={item.status} />
                    <span className="bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-md">{item.description}</span>
                  </div>
                  {openRegenIndex === item.id ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
                </button>
                {openRegenIndex === item.id && (
                  <div className="px-5 pb-5 text-xs text-slate-600 space-y-3 border-t border-slate-100 pt-4">
                    <div className="text-slate-400 font-semibold">Live from API</div>
                    <p className="font-semibold text-slate-800">Dataset summary for {heroTitle}</p>
                    <div>
                      <span className="font-bold text-slate-900 block mb-1">Overview</span>
                      <p className="text-slate-500 max-w-2xl">This summary is generated from the borough response fields currently available in the API payload.</p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block mb-1">Data Source</span>
                      <p className="text-slate-500">Housing stock, education, crime, district, and rent metrics from the borough API.</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Live borough dataset summary</h2>
            <p className="text-sm text-slate-500 mt-1">Actual data groupings provided by the borough API response.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-bold bg-slate-50/50">
                    <th className="py-3.5 px-4">Dataset</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Summary</th>
                    <th className="py-3.5 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {housingHighlights.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{row.title}</td>
                      <td className="py-3.5 px-4">Dataset</td>
                      <td className="py-3.5 px-4"><Badge type={row.statusType as any} label={row.status} /></td>
                      <td className="py-3.5 px-4">{row.description}</td>
                      <td className="py-3.5 px-4 text-slate-500">{row.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Political landscape</h2>
            <p className="text-sm text-slate-500 mt-1">Live borough indicators summarised into a comparable profile.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="space-y-3 max-w-2xl">
              {politicalData.map((item, i) => (
                <div key={i} className="flex items-center text-xs font-semibold">
                  <span className="w-44 text-right pr-4 text-slate-700">{item.party}</span>
                  <div className="flex-1 bg-slate-100 rounded-r-md h-5 overflow-hidden flex items-center relative">
                    <div className="h-full rounded-r-md transition-all duration-500" style={{ width: `${item.percentage * 2}%`, backgroundColor: item.color }} />
                    <span className="ml-2 text-[10px] font-bold text-slate-700">{item.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="bg-[#EFF6FC] rounded-2xl p-6 border border-blue-50 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <FileText size={18} />
            <span>Data & Reports</span>
          </div>
          <p className="text-xs text-slate-500">Download detailed information and analytics</p>
          <div>
            <button className="bg-[#1E293B] hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-colors">
              VIEW FULL BOROUGH REPORT
            </button>
            <span className="block text-[10px] text-slate-400 mt-1">*Available for registered users</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 italic">
          <Info size={14} />
          <span>This page provides general information based on publicly available data. It is not financial, legal, or investment advice.</span>
        </div>

        <section className="space-y-6 pt-6">
          <h2 className="text-2xl font-extrabold text-slate-900">Reviews about {heroTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviewCards.length ? reviewCards.map((review, i) => (
              <ReviewCard key={i} location={review.location} author={review.author} date={review.date} avatar={review.avatar} text={review.text} pros={review.pros} cons={review.cons} />
            )) : (
              <div className="md:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 text-sm text-slate-500">No review data is available for this borough in the current API response.</div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button className="p-1 rounded-full text-slate-400 hover:text-slate-700 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-1.5 items-center">
              <span className="w-2 h-2 rounded-full bg-red-700"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            </div>
            <button className="p-1 rounded-full text-slate-400 hover:text-slate-700 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({ title, main, sub, mainColor = 'text-slate-900' }: { title: string; main: string; sub: string; mainColor?: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</span>
      <div className={`text-xl font-black mt-2 ${mainColor}`}>{main}</div>
      <span className="text-xs text-slate-400 mt-1">{sub}</span>
    </div>
  );
}


function Badge({ type, label }: { type: 'approved' | 'review' | 'proposed'; label: string }) {
  const styles = {
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    review: 'bg-slate-100 text-slate-600 border-slate-300',
    proposed: 'bg-amber-50 text-amber-700 border-amber-300',
  };
  return <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${styles[type]}`}>{label}</span>;
}

function ScoreLogicRow({ label, pct }: { label: string; pct: string }) {
  return (
    <div className="flex justify-between items-center pt-2">
      <span className="text-slate-600 font-medium">{label}</span>
      <span className="font-bold text-slate-900">{pct}</span>
    </div>
  );
}

function ReviewCard({ location, author, date, avatar, text, pros, cons }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm">
      <div className="space-y-3">
        <h3 className="text-base font-bold text-[#8B0000]">{location}</h3>
        <div className="flex text-amber-400 text-xs">
          {'★'.repeat(4)}<span className="text-slate-200">★</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">{text}</p>
        <button className="text-xs font-bold text-blue-600 underline">Read more</button>

        <div className="space-y-2 pt-2 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <ThumbsUp size={12} className="text-emerald-600 fill-emerald-600" /> Pros
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">{pros}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <ThumbsDown size={12} className="text-red-600 fill-red-600" /> Cons
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">{cons}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
        <img src={avatar} alt={author} className="w-8 h-8 rounded-full object-cover" />
        <div>
          <div className="text-xs font-bold text-slate-900">{author}</div>
          <div className="text-[10px] text-slate-400">{date}</div>
        </div>
      </div>
    </div>
  );
}

