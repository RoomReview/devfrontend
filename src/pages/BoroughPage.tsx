import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronDown, Info, ExternalLink } from 'lucide-react';

import { boroughService, type BoroughListItem } from '@/services/borough.service';
import type { BoroughApiResponse } from '@/types/borough.types';
import boroughImages from '@/config/boroughImages';
import boroughFallbackImage from '@img/city.jpg';


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

      } catch (e) {
        setBoroughApi(null);
        setHasLoadError(true);
        setBoroughs([]);
        setSelectedComparisonIds([]);
        setComparisonApis([]);
        setPropertyTypes(['ALL']);
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

  const rentTrendValues = rentDataFiltered.map((r: any) => Number(r.rent ?? 0));
  const rentTrendYears = rentTrendValues.length
    ? Array.from({ length: rentTrendValues.length }, (_, i) => `Period ${i + 1}`)
    : [];

  const comparisonSeries = comparisonApis.map((borough) => ({
    name: borough.name,
    values: (borough.rentData ?? [])
      .filter((rent: any) => !selectedPropertyType || selectedPropertyType === 'ALL' || (rent.type || '').toUpperCase() === selectedPropertyType.toUpperCase())
      .map((rent: any) => Number(rent.rent ?? 0)),
  })).filter((series) => series.values.length > 0);

  const comparisonYears = comparisonSeries.length
    ? Array.from({ length: Math.max(...comparisonSeries.map((series) => series.values.length)) }, (_, index) => `Period ${index + 1}`)
    : rentTrendYears;

  const comparisonMin = Math.min(...comparisonSeries.flatMap((series) => series.values), 0);
  const comparisonMax = Math.max(...comparisonSeries.flatMap((series) => series.values), 1);
  const svgHeight = 120;
  const leftPad = 20;
  const innerW = 460;

  const rentMin = rentTrendValues.length ? Math.min(...rentTrendValues) : undefined;
  const rentMax = rentTrendValues.length ? Math.max(...rentTrendValues) : undefined;

  const displayRentRange = rentMin !== undefined && rentMax !== undefined
    ? `${new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(rentMin)} – ${new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(rentMax)}`
    : null;

  const heroTitle = boroughApi?.name ?? (selectedBorough || 'Borough');
  const heroText = boroughApi?.description ?? 'Detailed borough data is currently unavailable.';
  const interestingText = boroughApi?.description ?? 'Useful borough context is currently unavailable.';
  const officialWebsite = typeof boroughApi?.officialWebsite === 'string' && boroughApi.officialWebsite.startsWith('https://')
    ? boroughApi.officialWebsite
    : null;

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

        {rentDataFiltered.length > 0 ? <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Housing: available rent observations</h2>
            <p className="text-sm text-slate-500 mt-1">Compare the available local rent observations for this borough.</p>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="borough-comparison" className="text-xs font-semibold text-slate-500 block mb-2">Compare boroughs</label>
              <div className="relative w-full max-w-xs">
                <button
                  id="borough-comparison"
                  type="button"
                  onClick={() => setIsComparisonOpen((open) => !open)}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-700 shadow-sm focus:border-[#8B0000] focus:outline-none focus:ring-1 focus:ring-[#8B0000]"
                  aria-expanded={isComparisonOpen}
                  aria-controls="borough-comparison-options"
                >
                  <span>Selected: {selectedComparisonIds.length}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isComparisonOpen ? 'rotate-180' : ''}`} />
                </button>

                {isComparisonOpen && (
                  <div
                    id="borough-comparison-options"
                    className="absolute left-0 right-0 z-20 mt-1 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
                    role="group"
                    aria-label="Boroughs to compare"
                  >
                    {boroughs.map((borough) => {
                      const isPrimary = borough.boroughId === primaryBoroughId;
                      const isSelected = selectedComparisonIds.includes(borough.boroughId);

                      return (
                        <label
                          key={borough.boroughId}
                          className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-xs font-semibold text-slate-700 ${isPrimary ? 'cursor-not-allowed bg-slate-50 text-slate-400' : 'hover:bg-slate-50'}`}
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

          {displayRentRange ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="TYPICAL MONTHLY RANGE" main={displayRentRange} sub="Across property types" />
          </div> : null}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
              <h4 className="text-base font-bold text-slate-900 mb-6">Monthly rent (£) — {selectedPropertyType}</h4>
              <div className="w-full h-44 relative overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none" role="img" aria-label="Average monthly rent comparison chart">
                  <line x1="0" y1="30" x2="500" y2="30" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="0" y1="70" x2="500" y2="70" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="#E2E8F0" strokeWidth="1" />
                  {comparisonSeries.map((series, seriesIndex) => {
                    const seriesPoints = series.values.map((value, index) => {
                      const x = leftPad + (index * innerW) / Math.max(1, comparisonYears.length - 1);
                      const y = svgHeight - 10 - ((value - comparisonMin) / Math.max(1, comparisonMax - comparisonMin)) * (svgHeight - 20);
                      return { x, y };
                    });
                    const path = seriesPoints.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join(' ');
                    const color = ['#8B0000', '#1769AA', '#2E7D32', '#7B1FA2', '#E65100', '#455A64'][seriesIndex % 6];
                    return (
                      <g key={series.name}>
                        <path d={path} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        {seriesPoints.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="4" fill={color} />)}
                      </g>
                    );
                  })}
                </svg>
                <div className="flex justify-between text-xs text-slate-600 mt-3 px-1 relative">
                  <div className="absolute top-0 left-0 right-0 h-3 border-t border-b border-slate-300">
                    {(comparisonYears.length ? comparisonYears : ['AVERAGE']).map((_, i) => (
                      <div
                        key={i}
                        className="absolute top-0 w-px h-3 bg-slate-300"
                        style={{ left: `${(i / Math.max(1, (comparisonYears.length || 1) - 1)) * 100}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between w-full pt-4">
                    {(comparisonYears.length ? comparisonYears : ['AVERAGE']).map((y, i) => (
                      <span key={i} className="text-center">{y}</span>
                    ))}
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600">
                  {comparisonSeries.map((series, index) => (
                    <span key={series.name} className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: ['#8B0000', '#1769AA', '#2E7D32', '#7B1FA2', '#E65100', '#455A64'][index % 6] }} />
                      {series.name}
                    </span>
                  ))}
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
        </section> : null}

        <section className="pt-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <h2 className="px-6 pt-6 text-xl font-extrabold text-slate-900">Transport map</h2>
            <p className="px-6 pt-2 text-sm text-slate-500">A location map for {heroTitle}; transport routes and places are provided by OpenStreetMap.</p>
            {boroughApi?.latitude != null && boroughApi.longitude != null ? (
              <iframe
                title={`Transport map for ${heroTitle}`}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${boroughApi.longitude - 0.08}%2C${boroughApi.latitude - 0.05}%2C${boroughApi.longitude + 0.08}%2C${boroughApi.latitude + 0.05}&layer=mapnik&marker=${boroughApi.latitude}%2C${boroughApi.longitude}`}
                className="mt-5 h-80 w-full border-0"
                loading="lazy"
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

function MetricCard({ title, main, sub, mainColor = 'text-slate-900' }: { title: string; main: string; sub: string; mainColor?: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</span>
      <div className={`text-xl font-black mt-2 ${mainColor}`}>{main}</div>
      <span className="text-xs text-slate-400 mt-1">{sub}</span>
    </div>
  );
}
