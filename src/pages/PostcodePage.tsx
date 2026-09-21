import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, BarChart3, Star, ArrowUpRight } from 'lucide-react';
import { H1, H2, H3, Body, } from '../components/common/Typography';
import { usePostcodeData } from '@/hooks/postcode/usePostcodeData';
import { scoreReportService } from '@/services/score-report.service';

type DistrictGeometry = {
  rings: number[][][];
  bounds: { minLatitude: number; minLongitude: number; maxLatitude: number; maxLongitude: number };
};

const toDistrictGeometry = (geometry: { type?: string; coordinates?: unknown }): DistrictGeometry | null => {
  if (!geometry?.coordinates || (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon')) {
    return null;
  }

  const rings = geometry.type === 'Polygon'
    ? geometry.coordinates as number[][][]
    : (geometry.coordinates as number[][][][]).flat();
  const points = rings.flat();
  if (!points.length) return null;

  const longitudes = points.map(([longitude]) => longitude);
  const latitudes = points.map(([, latitude]) => latitude);

  return {
    rings,
    bounds: {
      minLatitude: Math.min(...latitudes),
      minLongitude: Math.min(...longitudes),
      maxLatitude: Math.max(...latitudes),
      maxLongitude: Math.max(...longitudes),
    },
  };
};

const PostcodePage = () => {
  const { postcode } = useParams();
  const normalized = useMemo(
    () => postcode?.replace(/%20/g, ' ').trim().toUpperCase() ?? '',
    [postcode],
  );

  const { data, isLoading, isError, error } = usePostcodeData(normalized);
  const [selectedPostcode, setSelectedPostcode] = useState(normalized || '');
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [districtGeometry, setDistrictGeometry] = useState<DistrictGeometry | null>(null);

  const postcodeData = data?.postcode ?? null;
  const rentData = data?.rentData ?? [];
  const demographicData = data?.demography ?? [];
  const crimeData = data?.crimeData ?? [];

  const avgRent = rentData.length
    ? `£${Number((rentData[0] as any).rent ?? 0).toLocaleString()}`
    : 'N/A';
  useEffect(() => {
    let isCurrent = true;

    const loadScore = async () => {
      if (!postcodeData?.postcode_id) {
        setOverallScore(null);
        return;
      }

      try {
        const preview = await scoreReportService.preview({
          postcodeId: postcodeData.postcode_id,
          boroughId: postcodeData.boroughId || undefined,
        });
        if (isCurrent) setOverallScore(preview.overallScore ?? null);
      } catch {
        if (isCurrent) setOverallScore(null);
      }
    };

    void loadScore();
    return () => {
      isCurrent = false;
    };
  }, [postcodeData]);

  const score = overallScore == null ? '—' : String(overallScore);
  const priceLabel = avgRent === 'N/A' ? null : avgRent;
  const mapCoordinates = postcodeData?.latitude != null && postcodeData.longitude != null
    ? { latitude: postcodeData.latitude, longitude: postcodeData.longitude }
    : null;
  const selectedDistrict = postcodeData?.outcode ?? normalized.split(' ')[0] ?? '';
  const totalCrimeItem = (crimeData as Array<{ label?: string; crime_rate?: number | string; value?: number | string }>).find(
    (item) => /total crimes per/i.test(String(item.label ?? '')),
  );

  const totalCrimeRate = Number(totalCrimeItem?.crime_rate ?? totalCrimeItem?.value ?? 1);

  const relativeCrimeData = (crimeData as Array<{ label?: string; crime_rate?: number | string; value?: number | string }>).filter(
    (item) => !/total crimes per/i.test(String(item.label ?? '')),
  );

  const crimePercentages = relativeCrimeData.map((item) => {
    const rawValue = Number(item.crime_rate ?? item.value ?? 0);
    if (!Number.isFinite(rawValue) || rawValue <= 0 || totalCrimeRate <= 0) return 0;
    return Math.min(100, (rawValue / totalCrimeRate) * 100);
  });

  const formatRent = (value: unknown) => {
    const rent = Number(value);
    return Number.isFinite(rent) && rent > 0 ? `£${rent.toLocaleString('en-GB')} pcm` : 'Data unavailable';
  };

  const formatRentType = (type: unknown) => {
    const label = String(type ?? 'average').replace(/[-_]/g, ' ');
    return label === 'average' ? 'Average' : label.replace(/\b\w/g, (character) => character.toUpperCase());
  };

  const formatCrimeValue = (value: number) => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return '0';
  if (numberValue >= 100) return numberValue.toFixed(0);
  return numberValue.toFixed(1); 
  };

  const BENCHMARK_MAX_CRIMES = 500;

  useEffect(() => {
    if (!selectedDistrict) {
      setDistrictGeometry(null);
      return;
    }

    const controller = new AbortController();
    const loadDistrictGeometry = async () => {
      try {
        const query = encodeURIComponent(`${selectedDistrict} postcode district, London, UK`);
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&polygon_geojson=1&limit=1&q=${query}`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) throw new Error('District boundary request failed');

        const results = await response.json() as Array<{ geojson?: { type?: string; coordinates?: unknown } }>;
        setDistrictGeometry(results[0]?.geojson ? toDistrictGeometry(results[0].geojson) : null);
      } catch {
        if (!controller.signal.aborted) setDistrictGeometry(null);
      }
    };

    void loadDistrictGeometry();
    return () => controller.abort();
  }, [selectedDistrict]);

  const mapBounds = useMemo(() => {
    if (districtGeometry) {
      const { minLatitude, minLongitude, maxLatitude, maxLongitude } = districtGeometry.bounds;
      const latitudePadding = Math.max((maxLatitude - minLatitude) * 0.12, 0.002);
      const longitudePadding = Math.max((maxLongitude - minLongitude) * 0.12, 0.002);
      return {
        minLatitude: minLatitude - latitudePadding,
        minLongitude: minLongitude - longitudePadding,
        maxLatitude: maxLatitude + latitudePadding,
        maxLongitude: maxLongitude + longitudePadding,
      };
    }

    if (!mapCoordinates) return null;
    return {
      minLatitude: mapCoordinates.latitude - 0.012,
      minLongitude: mapCoordinates.longitude - 0.02,
      maxLatitude: mapCoordinates.latitude + 0.012,
      maxLongitude: mapCoordinates.longitude + 0.02,
    };
  }, [districtGeometry, mapCoordinates]);

  const districtPaths = useMemo(() => {
    if (!districtGeometry || !mapBounds) return [];
    const longitudeRange = Math.max(mapBounds.maxLongitude - mapBounds.minLongitude, 0.0001);
    const latitudeRange = Math.max(mapBounds.maxLatitude - mapBounds.minLatitude, 0.0001);
    return districtGeometry.rings.map((ring) => ring.map(([longitude, latitude], index) => {
      const x = ((longitude - mapBounds.minLongitude) / longitudeRange) * 100;
      const y = 100 - ((latitude - mapBounds.minLatitude) / latitudeRange) * 100;
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
    }).join(' ') + ' Z');
  }, [districtGeometry, mapBounds]);

  const markerPosition = useMemo(() => {
    if (!mapCoordinates || !mapBounds) return null;
    return {
      left: `${((mapCoordinates.longitude - mapBounds.minLongitude) / (mapBounds.maxLongitude - mapBounds.minLongitude)) * 100}%`,
      top: `${100 - ((mapCoordinates.latitude - mapBounds.minLatitude) / (mapBounds.maxLatitude - mapBounds.minLatitude)) * 100}%`,
    };
  }, [mapCoordinates, mapBounds]);


  return (
    <div className="min-h-screen bg-white">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link to="/postcode-search" className="text-[#8B0202] font-semibold hover:underline inline-flex items-center gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to post codes
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <H1 className="text-[#1A2B3C] leading-tight">{normalized || 'Postcode'}</H1>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {overallScore != null ? <div className="inline-flex items-center gap-2 rounded-full bg-[#E8F7EE] px-4 py-3 text-sm font-semibold text-[#046C3D] shadow-sm">
              <span>RoomReview Score:</span>
              <span className="text-[#0B640D]">{score}%</span>
            </div> : null}
            {priceLabel ? <div className="inline-flex items-center gap-2 rounded-full bg-[#FBE7F1] px-4 py-3 text-sm font-semibold text-[#9D174D] shadow-sm"><span>Avg. Price:</span><span>{priceLabel}</span></div> : null}
          </div>
        </div>

        {isLoading ? (
          <div className="mt-12 rounded-[32px] border border-[#E5DCD5] bg-white p-8 shadow-sm">
            <Body>Loading postcode data...</Body>
          </div>
        ) : isError ? (
          <div className="mt-12 rounded-[32px] border border-[#E5DCD5] bg-white p-8 shadow-sm">
            <Body className="text-[#8B0202]">Unable to load postcode data.</Body>
            <Body>{String(error)}</Body>
          </div>
        ) : (
          <>
            <div className="mt-10 rounded-2xl border border-[#E5DCD5] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[#8B0202]" />
                <H2 className="text-[#1A2B3C]">Location and local area</H2>
              </div>
              {mapCoordinates && mapBounds ? (
                <div className="relative mt-4 h-64 overflow-hidden rounded-xl bg-[#dce7e8]" aria-label={`Fixed map showing postcode area ${selectedDistrict}`}>
                  <iframe
                    title={`Map showing postcode area ${selectedDistrict}`}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapBounds.minLongitude}%2C${mapBounds.minLatitude}%2C${mapBounds.maxLongitude}%2C${mapBounds.maxLatitude}&layer=mapnik&marker=${mapCoordinates.latitude},${mapCoordinates.longitude}`}
                    className="pointer-events-none absolute inset-0 h-full w-full border-0"
                    loading="lazy"
                  />
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    aria-hidden="true"
                  >
                    {districtPaths.map((path, index) => (
                      <path
                        key={index}
                        d={path}
                        fill="#38bdf8"
                        fillOpacity="0.28"
                        stroke="#0284c7"
                        strokeWidth="0.8"
                        vectorEffect="non-scaling-stroke"
                        fillRule="evenodd"
                      />
                    ))}
                  </svg>
                  <span className="pointer-events-none absolute left-4 top-4 rounded bg-white/90 px-2 py-1 text-xs font-semibold text-[#075985] shadow-sm">
                    Postcode area {selectedDistrict || 'unavailable'}
                  </span>
                  {markerPosition ? (
                    <span
                      className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#0284c7] shadow-md"
                      style={markerPosition}
                      aria-hidden="true"
                    />
                  ) : null}
                </div>
              ) : (
                <div className="mt-4 flex h-64 items-center justify-center rounded-xl bg-[#E9F2FF] text-sm text-[#4B5563]">
                  Map data is unavailable for this postcode.
                </div>
              )}
              <Link to="/data-sources" className="mt-3 inline-block text-sm font-semibold text-[#8B0202] hover:underline">View data sources and methodology</Link>
            </div>

            <div className="mt-8 grid gap-8 xl:grid-cols-[1.4fr_0.6fr]">
              <div className="space-y-8">
                <div className="rounded-[32px] border border-[#E5DCD5] bg-white p-8 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-[#8B0202]" />
                    <H3 className="text-[#1A2B3C]">Crime activity</H3>
                  </div>
                  <Body className="text-[#4B5563] mb-6">Crime statistics are based on publicly available data and are provided as a general indication of area trends. Information may vary over time and should be used as a guide only.</Body>
                  <div className="space-y-4">
                    {crimeData.length ? (() => {
                      const totalItem = (crimeData as Array<{ label?: string; crime_rate?: number | string; value?: number | string }>).find(
                        (item) => /total crimes per/i.test(String(item.label ?? '')),
                      );
                      const totalRate = Number(totalItem?.crime_rate ?? totalItem?.value ?? 0);
                      const rows = (crimeData as Array<{ label?: string; crime_rate?: number | string; value?: number | string; borough?: string }>).slice(0, 6);

                      return rows.map((item, index: number) => {
                        const rawValue = Number(item.crime_rate ?? item.value ?? 0);
                        const isTotal = /total crimes per/i.test(String(item.label ?? ''));

                        if (isTotal) {
                          const normalizedTotal = rawValue / 10;
                          const displayValue = `${formatCrimeValue(normalizedTotal)}`;
                          const barWidth = Math.min(100, (normalizedTotal / BENCHMARK_MAX_CRIMES) * 100);

                          return (
                            <div key={`${item.label ?? index}-${index}`}>
                              <div className="flex justify-between text-sm font-semibold text-[#1A2B3C]">
                                <span>{item.label ?? item.borough ?? `Crime ${index + 1}`}</span>
                                <span>{displayValue}</span>
                              </div>
                              <div className="mt-2 h-4 rounded-full bg-[#E5E7EB]">
                                <div
                                  className="h-full rounded-full bg-[#059669]"
                                  style={{ width: `${barWidth}%` }}
                                />
                              </div>
                            </div>
                          );
                        }

                        const pct = totalRate > 0 ? (rawValue / totalRate) * 100 : (rawValue > 100 ? rawValue / 10 : rawValue);
                        const displayValue = `${formatCrimeValue(pct)}%`;
                        const barWidth = Math.max(0, Math.min(100, pct));
                        const barColor = barWidth >= 30
                          ? 'bg-[#DC2626]'
                          : barWidth >= 15
                            ? 'bg-[#F59E0B]'
                            : 'bg-[#059669]';

                        return (
                          <div key={`${item.label ?? index}-${index}`}>
                            <div className="flex justify-between text-sm font-semibold text-[#1A2B3C]">
                              <span>{item.label ?? item.borough ?? `Crime ${index + 1}`}</span>
                              <span>{displayValue}</span>
                            </div>
                            <div className="mt-2 h-4 rounded-full bg-[#E5E7EB]">
                              <div
                                className={`h-full rounded-full ${barColor}`}
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                          </div>
                        );
                      });
                    })() : <Body className="text-[#6B7280]">Crime data unavailable for this postcode.</Body>}
                  </div>
                  <p className="mt-4 text-xs text-[#6B7280]">Values are shown as a percentage of the local risk level for comparison.</p>
                </div>

                <div className="rounded-[32px] border border-[#E5DCD5] bg-white p-8 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-[#8B0202]" />
                    <H3 className="text-[#1A2B3C]">Demographics</H3>
                  </div>
                  <Body className="text-[#4B5563] mb-6">Demographic data provides a general overview of the people living in the area based on publicly available statistics.</Body>
                  <div className="space-y-4">
                    {demographicData.length ? demographicData.slice(0, 7).map((item: any, index: number) => (
                      <div key={`${item.age_group ?? item.label ?? index}-${index}`}>
                        <div className="flex justify-between text-sm font-semibold text-[#1A2B3C]">
                          <span>{item.age_group ?? item.label ?? `Group ${index + 1}`}</span>
                          <span>{item.percentage ? `${item.percentage}%` : `${item.value ?? 0}%`}</span>
                        </div>
                        <div className="mt-2 h-4 rounded-full bg-[#E5E7EB]">
                          <div className="h-full rounded-full bg-[#8B0202]" style={{ width: `${Number(item.percentage ?? item.value ?? 0)}%` }} />
                        </div>
                      </div>
                    )) : <Body className="text-[#6B7280]">Demographic data unavailable for this postcode.</Body>}
                  </div>
                </div>
              </div>

              <aside className="space-y-6">
                <div className="rounded-[32px] border border-[#E5DCD5] bg-white p-8 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <H3 className="text-[#1A2B3C]">Rent snapshot</H3>
                  </div>
                  <div className="space-y-3">
                    {rentData.length ? rentData.map((item: any, index: number) => (
                      <div key={`${item.type ?? 'rent'}-${index}`} className="flex items-center justify-between gap-4 border-b border-[#F1ECE7] pb-3 text-sm last:border-0 last:pb-0">
                        <span className="text-[#4B5563]">{formatRentType(item.type)}</span>
                        <span className="font-semibold text-[#1A2B3C]">{formatRent(item.rent)}</span>
                      </div>
                    )) : <Body className="text-[#6B7280]">Rent data unavailable for this postcode.</Body>}
                  </div>
                  <Body className="mt-4 text-xs text-[#6B7280]">Indicative monthly rent from the available local dataset.</Body>
                </div>
              </aside>
            </div>

            <div className="mt-12">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <H2 className="text-[#1A2B3C]">Most recent reviews</H2>
              </div>

              <Body className="mt-6 rounded-2xl border border-dashed border-[#D9D5D0] p-5 text-[#6B7280]">No reviews are available for this postcode yet.</Body>
            </div>

            <div className="mt-12 rounded-[36px] bg-[#FBE9E6] p-8 shadow-sm">
              <div className="mb-8">
                <H2 className="text-[#1A2B3C]">Leave a review about {normalized}</H2>
                <Body className="text-[#4B5563] mt-2">Share your experience of the postcode and help others understand the local area.</Body>
              </div>

              <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-6">
                  <div>
                    <p className="text-sm uppercase tracking-[0.14em] text-[#8B0202] mb-2">Ratings</p>
                    <div className="flex items-center gap-1 text-[#D97706]">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className="w-5 h-5" />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm uppercase tracking-[0.14em] text-[#8B0202] mb-2">Postcode</p>
                    <label className="sr-only" htmlFor="review-postcode">
                      Choose your full postcode
                    </label>
                    <select
                      id="review-postcode"
                      value={selectedPostcode}
                      onChange={(event) => setSelectedPostcode(event.target.value)}
                      className="w-full rounded-[18px] border border-[#D9D5D0] bg-white px-4 py-3 text-sm text-[#1A2B3C] focus:outline-none"
                    >
                      <option value="">Choose your full postcode</option>
                      {normalized ? <option value={normalized}>{normalized}</option> : null}
                    </select>
                  </div>

                  <div>
                    <p className="text-sm uppercase tracking-[0.14em] text-[#8B0202] mb-2">Status</p>
                    <select className="w-full rounded-[18px] border border-[#D9D5D0] bg-white px-4 py-3 text-sm text-[#1A2B3C] focus:outline-none">
                      <option>Select your relation to the property/area</option>
                      <option>Local resident</option>
                      <option>User</option>
                      <option>Visitor</option>
                    </select>
                  </div>

                  <div>
                    <p className="text-sm uppercase tracking-[0.14em] text-[#8B0202] mb-2">Write your review</p>
                    <textarea className="min-h-[200px] w-full rounded-[24px] border border-[#D9D5D0] bg-white p-5 text-sm text-[#1A2B3C] focus:outline-none" placeholder="Write your review" />
                  </div>

                  <div className="rounded-[24px] border border-[#D9D5D0] bg-white p-5 text-center text-sm text-[#1A2B3C]">
                    <ArrowUpRight className="inline-block mr-2 w-4 h-4" /> Click here to upload images
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-[24px] bg-white p-5 shadow-sm">
                    <p className="text-sm uppercase tracking-[0.14em] text-[#8B0202] mb-2">Pros</p>
                    <textarea className="min-h-[120px] w-full rounded-[20px] border border-[#E5E7EB] bg-[#F8FAFC] p-4 text-sm text-[#1A2B3C] focus:outline-none" placeholder="What's good about living here" />
                  </div>

                  <div className="rounded-[24px] bg-white p-5 shadow-sm">
                    <p className="text-sm uppercase tracking-[0.14em] text-[#8B0202] mb-2">Cons</p>
                    <textarea className="min-h-[120px] w-full rounded-[20px] border border-[#E5E7EB] bg-[#F8FAFC] p-4 text-sm text-[#1A2B3C] focus:outline-none" placeholder="What could be better" />
                  </div>

                  <div className="space-y-4 rounded-[24px] bg-white p-5 shadow-sm">
                    <label className="flex items-center gap-3 text-sm text-[#1A2B3C]">
                      <input type="checkbox" className="h-4 w-4 rounded border-[#D9D5D0] text-[#8B0202] focus:ring-[#8B0202]" />
                      <span>First Name only</span>
                    </label>
                    <label className="flex items-center gap-3 text-sm text-[#1A2B3C]">
                      <input type="checkbox" className="h-4 w-4 rounded border-[#D9D5D0] text-[#8B0202] focus:ring-[#8B0202]" />
                      <span>Stay Anonymous</span>
                    </label>
                  </div>
                </div>
              </div>

              <Link to="/register" className="flex w-full items-center justify-center rounded-lg bg-[#8B0202] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6A0101]">Create an account to submit your review</Link>
            </div>

          </>
        )}
      </section>
    </div>
  );
};

export default PostcodePage;
