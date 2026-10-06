import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, Star, UserRound } from 'lucide-react';
import { H1, H2, H3, Body, } from '../components/common/Typography';
import { usePostcodeData } from '@/hooks/postcode/usePostcodeData';
import { normalizePostcode, postcodePath } from '@/utils/helpers';
import { usePostcodeReviews } from '@/hooks/reviews/useReviews';
import { useAuth } from '@/hooks/useAuth';
import { reviewService } from '@/services/review.service';
import { scoreReportService } from '@/services/score-report.service';
import { queryKeys } from '@/lib/queryKeys';
import { extractApiError } from '@/utils/apiError';

const reviewRatingCategories = [
  { key: 'safety_rating', label: 'Safety' },
  { key: 'transport_rating', label: 'Transport' },
  { key: 'amenities_rating', label: 'Amenities' },
  { key: 'value_rating', label: 'Value for money' },
] as const;

type ReviewRatingKey = typeof reviewRatingCategories[number]['key'];
type ReviewRatings = Record<ReviewRatingKey, number>;

type DistrictGeometry = {
  rings: number[][][];
  bounds: { minLatitude: number; minLongitude: number; maxLatitude: number; maxLongitude: number };
};

type DemographicPoint = {
  age_group?: string;
  female_percentage?: number;
  male_percentage?: number;
  percentage?: number;
  period?: string | null;
};

const DemographicsChart = ({ data }: { data: DemographicPoint[] }) => {
  const hasSexBreakdown = data.some((item) => item.female_percentage != null || item.male_percentage != null);
  const rows = data.slice(0, 7).map((item, index) => ({
    age: item.age_group ?? `Group ${index + 1}`,
    female: Number(item.female_percentage ?? 0),
    male: Number(item.male_percentage ?? 0),
  })).reverse();
  const maximumPercentage = Math.max(20, ...rows.flatMap((row) => [row.female, row.male]));
  const scaleMaximum = Math.ceil(maximumPercentage / 5) * 5;
  const ticks = Array.from({ length: scaleMaximum / 5 + 1 }, (_, index) => index * 5);
  const width = 760;
  const height = 350;
  const centerX = 380;
  const halfPlotWidth = 245;
  const plotTop = 45;
  const rowGap = 31;
  const axisY = plotTop + rowGap * rows.length;
  const xFor = (value: number) => centerX + (value / scaleMaximum) * halfPlotWidth;
  const period = data.find((item) => item.period)?.period ?? 'Latest available';

  return (
    <div className="rounded-[18px] border border-[#E5DCD5] bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-1 flex items-center justify-end gap-4 text-sm text-[#1A1A1A]">
        <button type="button" aria-label="Previous demographic period" disabled className="cursor-not-allowed text-[#A3A3A3]">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-[112px] text-center">{period}</span>
        <button type="button" aria-label="Next demographic period" disabled className="cursor-not-allowed text-[#A3A3A3]">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      {hasSexBreakdown ? (
        <div className="overflow-x-auto">
          <svg className="h-auto min-w-[520px] w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Population by age group and sex">
            <rect width={width} height={height} fill="#ffffff" />
            {ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={xFor(-tick)}
                  y1={plotTop - 4}
                  x2={xFor(-tick)}
                  y2={axisY}
                  stroke={tick === 0 ? '#4b4b4b' : '#ece8e6'}
                  strokeDasharray={tick === 0 ? undefined : '3 4'}
                />
                {tick > 0 ? (
                  <line x1={xFor(tick)} y1={plotTop - 4} x2={xFor(tick)} y2={axisY} stroke="#ece8e6" strokeDasharray="3 4" />
                ) : null}
                <text x={xFor(-tick)} y={axisY + 20} textAnchor="middle" fill="#4b4b4b" fontSize="11">{tick}%</text>
                {tick > 0 ? <text x={xFor(tick)} y={axisY + 20} textAnchor="middle" fill="#4b4b4b" fontSize="11">{tick}%</text> : null}
              </g>
            ))}
            {rows.map((row, index) => {
              const y = plotTop + index * rowGap;
              const femaleWidth = (row.female / scaleMaximum) * halfPlotWidth;
              const maleWidth = (row.male / scaleMaximum) * halfPlotWidth;
              return (
                <g key={row.age}>
                  <text x="28" y={y + 16} fill="#333333" fontSize="12">{row.age}</text>
                  <rect x={centerX - femaleWidth} y={y + 3} width={femaleWidth} height="22" fill="#F3E6E1">
                    <title>{`Female ${row.age}: ${row.female.toFixed(1)}%`}</title>
                  </rect>
                  <rect x={centerX} y={y + 3} width={maleWidth} height="22" fill="#8B0000">
                    <title>{`Male ${row.age}: ${row.male.toFixed(1)}%`}</title>
                  </rect>
                </g>
              );
            })}
            <line x1={xFor(-scaleMaximum)} y1={axisY} x2={xFor(scaleMaximum)} y2={axisY} stroke="#4b4b4b" />
            <g aria-hidden="true">
              <circle cx="342" cy="326" r="5.5" fill="#F3E6E1" />
              <text x="354" y="330" fill="#4b4b4b" fontSize="11">Female</text>
              <circle cx="414" cy="326" r="5.5" fill="#8B0000" />
              <text x="426" y="330" fill="#4b4b4b" fontSize="11">Male</text>
            </g>
          </svg>
        </div>
      ) : (
        <div className="space-y-3 px-2 py-4">
          {rows.map((row) => {
            const value = Number(data.find((item) => item.age_group === row.age)?.percentage ?? 0);
            return (
              <div key={row.age}>
                <div className="flex justify-between text-xs font-medium text-[#4B5563]"><span>{row.age}</span><span>{value.toFixed(1)}%</span></div>
                <div className="mt-1.5 h-3 bg-[#F3E6E1]"><div className="h-full bg-[#8B0000]" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
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
  const location = useLocation();
  const navigate = useNavigate();
  const normalized = useMemo(() => normalizePostcode(postcode ?? ''), [postcode]);

  useEffect(() => {
    const canonicalPath = postcodePath(normalized);
    if (normalized && location.pathname !== canonicalPath) {
      navigate(canonicalPath, { replace: true });
    }
  }, [location.pathname, navigate, normalized]);

  const { data, isLoading, isError, error } = usePostcodeData(normalized);
  const { loading: authLoading, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [districtGeometry, setDistrictGeometry] = useState<DistrictGeometry | null>(null);
  const [reviewRatings, setReviewRatings] = useState<ReviewRatings>({
    safety_rating: 0,
    transport_rating: 0,
    amenities_rating: 0,
    value_rating: 0,
  });
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [reviewPros, setReviewPros] = useState('');
  const [reviewCons, setReviewCons] = useState('');
  const [yearsLived, setYearsLived] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const postcodeData = data?.postcode ?? null;
  const {
    data: postcodeReviews = [],
    isLoading: reviewsLoading,
    isError: reviewsError,
  } = usePostcodeReviews(postcodeData?.postcodeId);
  const rentData = data?.rentData ?? [];
  const demographicData = data?.demography ?? [];
  const crimeData = data?.crimeData ?? [];

  const avgRent = rentData.length
    ? `£${Number((rentData[0] as any).rent ?? 0).toLocaleString()}`
    : 'N/A';
  useEffect(() => {
    let isCurrent = true;

    const loadScore = async () => {
      if (!postcodeData?.postcodeId) {
        setOverallScore(null);
        return;
      }

      try {
        const preview = await scoreReportService.preview({
          postcodeId: postcodeData.postcodeId,
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
  const signedLsoaMapUrl = data?.lsoaMap?.imageUrl ?? null;
  const lsoaMap = data?.lsoaMap;
  const dynamicPostcodeMarker = mapCoordinates && lsoaMap
    && lsoaMap.maxLon > lsoaMap.minLon
    && lsoaMap.maxLat > lsoaMap.minLat
    && mapCoordinates.longitude >= lsoaMap.minLon
    && mapCoordinates.longitude <= lsoaMap.maxLon
    && mapCoordinates.latitude >= lsoaMap.minLat
    && mapCoordinates.latitude <= lsoaMap.maxLat
    ? {
        x: ((mapCoordinates.longitude - lsoaMap.minLon) / (lsoaMap.maxLon - lsoaMap.minLon)) * lsoaMap.imageWidthPx,
        y: ((lsoaMap.maxLat - mapCoordinates.latitude) / (lsoaMap.maxLat - lsoaMap.minLat)) * lsoaMap.imageHeightPx,
      }
    : null;
  const selectedDistrict = postcodeData?.outcode ?? normalized.split(' ')[0] ?? '';
  const totalCrimeItem = (crimeData as Array<{ label?: string; crime_rate?: number | string; value?: number | string }>).find(
    (item) => /total crimes per/i.test(String(item.label ?? '')),
  );

  const totalCrimeRate = Number(totalCrimeItem?.crime_rate ?? totalCrimeItem?.value ?? 1);

  const relativeCrimeData = (crimeData as Array<{ label?: string; crime_rate?: number | string; value?: number | string }>).filter(
    (item) => !/total crimes per/i.test(String(item.label ?? '')),
  );

  const handleReviewSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setReviewError('');
    setReviewSubmitted(false);

    if (!postcodeData?.postcodeId) {
      setReviewError('Postcode details are not available. Please try again shortly.');
      return;
    }
    if (reviewRatingCategories.some(({ key }) => reviewRatings[key] === 0)) {
      setReviewError('Please rate safety, transport, amenities, and value for money.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await reviewService.create({
        title: reviewTitle.trim(),
        content: reviewContent.trim(),
        ...reviewRatings,
        pros: reviewPros.split(/\r?\n/).map((item) => item.trim()).filter(Boolean),
        cons: reviewCons.split(/\r?\n/).map((item) => item.trim()).filter(Boolean),
        years_lived: yearsLived ? Number(yearsLived) : null,
        anonymous,
        postcode_id: postcodeData.postcodeId,
        borough_id: postcodeData.boroughId,
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.postcodeReviews(postcodeData.postcodeId),
      });
      setReviewSubmitted(true);
      setReviewTitle('');
      setReviewContent('');
      setReviewPros('');
      setReviewCons('');
      setYearsLived('');
      setReviewRatings({
        safety_rating: 0,
        transport_rating: 0,
        amenities_rating: 0,
        value_rating: 0,
      });
      setAnonymous(false);
    } catch (submitError) {
      setReviewError(extractApiError(submitError));
    } finally {
      setIsSubmittingReview(false);
    }
  };

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
              {signedLsoaMapUrl && data?.lsoaMap && dynamicPostcodeMarker ? (
                <div
                  className="relative mt-4 aspect-[8/5] w-full overflow-hidden rounded-xl bg-[#dce7e8]"
                  role="img"
                  aria-label={`LSOA map with searched postcode ${normalized} marked`}
                >
                  <img
                    src={signedLsoaMapUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full"
                    loading="lazy"
                    decoding="async"
                  />
                  {dynamicPostcodeMarker ? (
                    <svg
                      viewBox={`0 0 ${data.lsoaMap.imageWidthPx} ${data.lsoaMap.imageHeightPx}`}
                      preserveAspectRatio="none"
                      className="pointer-events-none absolute inset-0 h-full w-full"
                      aria-hidden="true"
                    >
                      <g transform={`translate(${dynamicPostcodeMarker.x.toFixed(1)},${dynamicPostcodeMarker.y.toFixed(1)})`}>
                        <path d="M0,0 C-13,-19 -13,-34 0,-34 C13,-34 13,-19 0,0 Z" fill="#3b82f6" stroke="#ffffff" strokeWidth="2.5" />
                        <circle cx="0" cy="-23" r="5.5" fill="#ffffff" />
                      </g>
                    </svg>
                  ) : null}
                </div>
              ) : mapCoordinates && mapBounds ? (
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

                <section className="space-y-4" aria-labelledby="postcode-demographics-title">
                  <div className="mb-4 flex items-center gap-3">
                    <UserRound className="w-5 h-5 text-[#1A1A1A]" />
                    <H3 id="postcode-demographics-title" className="text-[#1A1A1A]">Demographics</H3>
                  </div>
                  <Body className="max-w-3xl text-[#4B5563]">Demographic data provides a general overview of the people living in the area based on publicly available statistics.</Body>
                  {demographicData.length
                    ? <DemographicsChart data={demographicData as DemographicPoint[]} />
                    : <Body className="text-[#6B7280]">Demographic data unavailable for this postcode.</Body>}
                </section>
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

            <div id="reviews" className="mt-12 scroll-mt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <H2 className="text-[#1A2B3C]">Most recent reviews</H2>
              </div>

              {reviewsLoading ? (
                <Body className="mt-6 text-[#6B7280]">Loading reviews...</Body>
              ) : reviewsError ? (
                <Body className="mt-6 rounded-2xl border border-dashed border-[#D9D5D0] p-5 text-[#6B7280]">
                  Reviews could not be loaded. Please try again later.
                </Body>
              ) : postcodeReviews.length ? (
                <div className="mt-6 space-y-4">
                  {postcodeReviews.map((review) => (
                    <article key={review.review_id} className="rounded-2xl border border-[#E5DCD5] bg-white p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <H3 className="text-[#1A2B3C]">{review.title}</H3>
                          <Body className="mt-1 text-sm text-[#6B7280]">
                            {review.anonymous ? 'Anonymous' : review.users?.firstName ?? 'Local reviewer'}
                            {' · '}
                            {new Date(review.created_at).toLocaleDateString('en-GB')}
                          </Body>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-semibold text-[#D97706]">
                          <Star className="h-4 w-4 fill-current" />
                          {Number(review.overall_rating).toFixed(1)} / 5
                        </div>
                      </div>
                      <Body className="mt-4 whitespace-pre-wrap text-[#4B5563]">{review.content}</Body>
                      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#6B7280]">
                        {reviewRatingCategories.map(({ key, label }) => (
                          <span key={key}>{label}: {review[key]}/5</span>
                        ))}
                      </div>
                      {review.pros.length > 0 ? (
                        <Body className="mt-3 text-sm text-[#4B5563]"><strong>Pros:</strong> {review.pros.join(' · ')}</Body>
                      ) : null}
                      {review.cons.length > 0 ? (
                        <Body className="mt-1 text-sm text-[#4B5563]"><strong>Cons:</strong> {review.cons.join(' · ')}</Body>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : (
                <Body className="mt-6 rounded-2xl border border-dashed border-[#D9D5D0] p-5 text-[#6B7280]">
                  No approved reviews are available for this postcode yet.
                </Body>
              )}
            </div>

            <form id="leave-review" onSubmit={handleReviewSubmit} className="mt-12 scroll-mt-6 rounded-[36px] bg-[#FBE9E6] p-8 shadow-sm">
              <div className="mb-8">
                <H2 className="text-[#1A2B3C]">Leave a review about {normalized}</H2>
                <Body className="text-[#4B5563] mt-2">Share your experience of the postcode and help others understand the local area.</Body>
              </div>

              <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-6">
                  <fieldset>
                    <legend className="mb-3 text-sm uppercase tracking-[0.14em] text-[#8B0202]">Ratings</legend>
                    <div className="space-y-3">
                      {reviewRatingCategories.map(({ key, label }) => (
                        <div key={key} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3">
                          <span className="text-sm font-medium text-[#1A2B3C]">{label}</span>
                          <div role="group" aria-label={`Rate ${label.toLowerCase()}`} className="flex items-center gap-1">
                            {Array.from({ length: 5 }, (_, index) => {
                              const value = index + 1;
                              const selected = reviewRatings[key] === value;
                              return (
                                <button
                                  key={value}
                                  type="button"
                                  aria-pressed={selected}
                                  aria-label={`${value} out of 5 for ${label.toLowerCase()}`}
                                  onClick={() => setReviewRatings((current) => ({ ...current, [key]: value }))}
                                  className="rounded p-1 text-[#D97706] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0202]"
                                >
                                  <Star className={`h-5 w-5 ${value <= reviewRatings[key] ? 'fill-current' : ''}`} />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </fieldset>

                  <div>
                    <p className="text-sm uppercase tracking-[0.14em] text-[#8B0202] mb-2">Postcode</p>
                    <label className="sr-only" htmlFor="review-postcode">Postcode for this review</label>
                    <input
                      id="review-postcode"
                      readOnly
                      value={postcodeData?.code ?? normalized}
                      className="w-full rounded-[18px] border border-[#D9D5D0] bg-white px-4 py-3 text-sm text-[#1A2B3C]"
                    />
                  </div>

                  <div>
                    <label htmlFor="review-years-lived" className="mb-2 block text-sm uppercase tracking-[0.14em] text-[#8B0202]">
                      Years lived in the area <span className="normal-case tracking-normal text-[#6B7280]">(optional)</span>
                    </label>
                    <input
                      id="review-years-lived"
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={yearsLived}
                      onChange={(event) => setYearsLived(event.target.value)}
                      className="w-full rounded-[18px] border border-[#D9D5D0] bg-white px-4 py-3 text-sm text-[#1A2B3C] focus:outline-none focus:ring-2 focus:ring-[#8B0202]"
                    />
                  </div>

                  <div>
                    <label htmlFor="review-title" className="mb-2 block text-sm uppercase tracking-[0.14em] text-[#8B0202]">Review title</label>
                    <input
                      id="review-title"
                      required
                      maxLength={120}
                      value={reviewTitle}
                      onChange={(event) => setReviewTitle(event.target.value)}
                      className="w-full rounded-[18px] border border-[#D9D5D0] bg-white px-4 py-3 text-sm text-[#1A2B3C] focus:outline-none focus:ring-2 focus:ring-[#8B0202]"
                      placeholder="Summarize your experience"
                    />
                  </div>

                  <div>
                    <label htmlFor="review-content" className="mb-2 block text-sm uppercase tracking-[0.14em] text-[#8B0202]">Write your review</label>
                    <textarea
                      id="review-content"
                      required
                      minLength={10}
                      maxLength={5000}
                      value={reviewContent}
                      onChange={(event) => setReviewContent(event.target.value)}
                      className="min-h-[200px] w-full rounded-[24px] border border-[#D9D5D0] bg-white p-5 text-sm text-[#1A2B3C] focus:outline-none focus:ring-2 focus:ring-[#8B0202]"
                      placeholder="Write your review"
                    />
                  </div>
                  <Body className="text-xs text-[#6B7280]">Reviews are text-only for now; image uploads are not available.</Body>
                </div>

                <div className="space-y-6">
                  <div className="rounded-[24px] bg-white p-5 shadow-sm">
                    <label htmlFor="review-pros" className="mb-2 block text-sm uppercase tracking-[0.14em] text-[#8B0202]">Pros</label>
                    <textarea
                      id="review-pros"
                      value={reviewPros}
                      onChange={(event) => setReviewPros(event.target.value)}
                      className="min-h-[120px] w-full rounded-[20px] border border-[#E5E7EB] bg-[#F8FAFC] p-4 text-sm text-[#1A2B3C] focus:outline-none focus:ring-2 focus:ring-[#8B0202]"
                      placeholder="What's good about living here? One point per line."
                    />
                  </div>

                  <div className="rounded-[24px] bg-white p-5 shadow-sm">
                    <label htmlFor="review-cons" className="mb-2 block text-sm uppercase tracking-[0.14em] text-[#8B0202]">Cons</label>
                    <textarea
                      id="review-cons"
                      value={reviewCons}
                      onChange={(event) => setReviewCons(event.target.value)}
                      className="min-h-[120px] w-full rounded-[20px] border border-[#E5E7EB] bg-[#F8FAFC] p-4 text-sm text-[#1A2B3C] focus:outline-none focus:ring-2 focus:ring-[#8B0202]"
                      placeholder="What could be better? One point per line."
                    />
                  </div>

                  <div className="rounded-[24px] bg-white p-5 shadow-sm">
                    <label className="flex items-center gap-3 text-sm text-[#1A2B3C]">
                      <input
                        type="checkbox"
                        checked={anonymous}
                        onChange={(event) => setAnonymous(event.target.checked)}
                        className="h-4 w-4 rounded border-[#D9D5D0] text-[#8B0202] focus:ring-[#8B0202]"
                      />
                      <span>Stay anonymous</span>
                    </label>
                  </div>
                </div>
              </div>

              {reviewError ? <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-800">{reviewError}</p> : null}
              {reviewSubmitted ? (
                <p role="status" className="mt-6 rounded-xl bg-green-50 p-4 text-sm text-green-800">
                  Your review was submitted and is awaiting moderation. Thank you for sharing your experience.
                </p>
              ) : null}
              {authLoading ? (
                <p className="mt-6 text-center text-sm text-[#4B5563]">Checking your account...</p>
              ) : isAuthenticated ? (
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="mt-6 flex w-full items-center justify-center rounded-lg bg-[#8B0202] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6A0101] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmittingReview ? 'Submitting review...' : 'Submit review'}
                </button>
              ) : (
                <div className="mt-6 space-y-3 text-center">
                  <p className="text-sm text-[#4B5563]">Sign in to submit your review.</p>
                  <div className="flex flex-col justify-center gap-3 sm:flex-row">
                    <Link to="/login" className="rounded-lg border border-[#8B0202] px-5 py-3 text-sm font-semibold text-[#8B0202] transition hover:bg-white">
                      Sign in
                    </Link>
                    <Link to="/register" className="rounded-lg bg-[#8B0202] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6A0101]">
                      Create an account
                    </Link>
                  </div>
                </div>
              )}
            </form>

          </>
        )}
      </section>
    </div>
  );
};

export default PostcodePage;
