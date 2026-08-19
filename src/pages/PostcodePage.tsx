import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, BarChart3, Star, Shield, ArrowUpRight } from 'lucide-react';
import { H1, H2, H3, Body, } from '../components/common/Typography';
import Button from '../components/common/Button';
import { usePostcodeData } from '@/hooks/postcode/usePostcodeData';
import ScoreReportPanel from '@/components/score-reports/ScoreReportPanel';

const PostcodePage = () => {
  const { postcode } = useParams();
  const normalized = useMemo(
    () => postcode?.replace(/%20/g, ' ').trim().toUpperCase() ?? '',
    [postcode],
  );

  const { data, isLoading, isError, error } = usePostcodeData(normalized);
  const [selectedPostcode, setSelectedPostcode] = useState(normalized || '');

  const postcodeData = data?.postcode ?? null;
  const rentData = data?.rentData ?? [];
  const demographicData = data?.demography ?? [];
  const crimeData = data?.crimeData ?? [];
  const educationData = data?.educationData ?? [];
  const housingStockData = data?.housingStockData ?? [];
  const districtData = data?.districtData ?? [];

  const avgRent = rentData.length
    ? `£${Number((rentData[0] as any).rent ?? 0).toLocaleString()}`
    : 'N/A';
  const score = String((postcodeData?.metrics as any)?.reviewScore ?? '—');
  const isSafe = Boolean((postcodeData?.metrics as any)?.safe);
  const reviewCount = 0;
  const priceLabel = `${avgRent}`;

  const mockCrimeData = crimeData.length > 0 ? crimeData : [
    { label: 'Crime 1', crime_rate: 20 },
    { label: 'Crime 2', crime_rate: 24 },
    { label: 'Crime 3', crime_rate: 40 },
    { label: 'Crime 4', crime_rate: 50 },
    { label: 'Crime 5', crime_rate: 80 },
    { label: 'Crime 6', crime_rate: 70 },
    { label: 'Others', crime_rate: 30 },
  ];

  const mockDemographics = demographicData.length > 0 ? demographicData : [
    { age_group: '60+', percentage: 8 },
    { age_group: '50-59', percentage: 12 },
    { age_group: '40-49', percentage: 14 },
    { age_group: '30-39', percentage: 18 },
    { age_group: '20-29', percentage: 20 },
    { age_group: '10-19', percentage: 12 },
    { age_group: '0-9', percentage: 8 },
  ];

  const fullPostcodeOptions = useMemo(() => {
    const prefix = normalized.trim().toUpperCase();
    const base = prefix.replace(/\s+/g, '').slice(0, 3);
    const variants = [
      `${base} 1AA`,
      `${base} 2BB`,
      `${base} 3CC`,
      `${base} 4DD`,
      `${base} 5EE`,
    ];

    if (prefix) {
      const normalizedWithSpace = prefix.replace(/\s+/g, ' ');
      return [normalizedWithSpace, ...variants.filter((value) => value !== normalizedWithSpace)];
    }

    return variants;
  }, [normalized]);

  const reviewCards = [
    {
      title: 'SW9 – Brixton',
      stars: 5,
      summary: 'Lorem ipsum dolor sit amet consectetur. In hac habitasse platea dictumst.',
      pros: 'Good local transport, vibrant community, strong rental demand.',
      cons: 'Noisy evenings and busy high streets.',
      author: 'James Moris',
      date: '2 days ago',
    },
    {
      title: 'NW2 4FM – Camden',
      stars: 5,
      summary: 'Lorem ipsum dolor sit amet consectetur. In hac habitasse platea dictumst.',
      pros: 'Great cafes and easy access to central London.',
      cons: 'Higher rents than neighbouring areas.',
      author: 'Anonymous',
      date: '2 months ago',
    },
    {
      title: 'SE22 0RS – Southwark',
      stars: 5,
      summary: 'Lorem ipsum dolor sit amet consectetur. In hac habitasse platea dictumst.',
      pros: 'Strong community feel and good amenities.',
      cons: 'Limited park space close to some sections.',
      author: 'Anastasia Kosheva',
      date: '14 February 2025',
    },
  ];

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
              <span className="rounded-full border border-[#E5DCD5] bg-[#F9F7F5] px-3 py-1 text-sm text-[#6B7280]">Borough</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E8F7EE] px-4 py-3 text-sm font-semibold text-[#046C3D] shadow-sm">
              <span>RoomReview Score:</span>
              <span className="text-[#0B640D]">{score}%</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#ECF5FF] px-4 py-3 text-sm font-semibold text-[#1D4ED8] shadow-sm">
              <Shield className="w-4 h-4 text-[#1D4ED8]" />
              <span>{isSafe ? 'SAFE' : 'RISKY'}</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FEF3C7] px-4 py-3 text-sm font-semibold text-[#92400E] shadow-sm">
              <Star className="w-4 h-4 text-[#92400E]" />
              <span>{reviewCount} reviews</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FBE7F1] px-4 py-3 text-sm font-semibold text-[#9D174D] shadow-sm">
              <span>Avg. Price:</span>
              <span>{priceLabel}</span>
            </div>
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
            <div className="mt-10 grid gap-8 xl:grid-cols-[1.4fr_0.6fr]">
              <div className="rounded-[32px] border border-[#E5DCD5] bg-white p-8 shadow-sm">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <H2 className="text-[#1A2B3C]">Property valuation</H2>
                    <Body className="text-[#0B0B0B] leading-7">Average rent data is compiled from publicly available sources and may not always be fully accurate or up to date.</Body>
                  </div>
                  <Button variant="secondary" className="whitespace-nowrap">Want the full area analysis?</Button>
                </div>
                <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
                  <div className="rounded-[32px] bg-[#F3F2F0] p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="space-y-1">
                        <p className="text-sm uppercase tracking-[0.18em] text-[#8B0202]">House · Flat · Studio</p>
                        <p className="text-xs text-[#6B7280]">Latest trends for the postcode area</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#8B0202]">Jan 2026</span>
                    </div>
                    <div className="relative h-[320px] overflow-hidden rounded-[28px] bg-gradient-to-br from-[#FEE2E2] via-[#FECACA] to-[#F9A8D4]">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.5),_transparent_35%)]" />
                      <div className="absolute inset-x-0 bottom-0 h-20 bg-white/80" />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-[32px] border border-[#E5DCD5] bg-[#F7FBFF] p-6 shadow-sm">
                      <div className="mb-4 flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-[#8B0202]" />
                        <H3 className="text-[#1A2B3C]">Nearest stations, lines, connections</H3>
                      </div>
                      <div className="space-y-3 text-sm text-[#4B5563]">
                        <p>Brixton — Victoria Line / 7 min walk</p>
                        <p>Stockwell — Victoria / Northern (11 min walk)</p>
                        <p>Central London — 18 min (on car)</p>
                        <p>Canary Wharf — 32 min (on car)</p>
                        <p>Heathrow — 55 min (on car)</p>
                      </div>
                    </div>
                    <div className="rounded-[32px] border border-[#E5DCD5] bg-white p-6 shadow-sm">
                      <div className="h-[220px] rounded-[28px] bg-[#E9F2FF]" />
                    </div>
                  </div>
                </div>
              </div>
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
                    {mockCrimeData.slice(0, 6).map((item: any, index: number) => (
                      <div key={`${item.label ?? index}-${index}`}>
                        <div className="flex justify-between text-sm font-semibold text-[#1A2B3C]">
                          <span>{item.label ?? item.borough ?? `Crime ${index + 1}`}</span>
                          <span>{item.crime_rate ? `${item.crime_rate}%` : item.percentage ? `${item.percentage}%` : '0%'}</span>
                        </div>
                        <div className="mt-2 h-4 rounded-full bg-[#E5E7EB]">
                          <div
                            className={`h-full rounded-full ${item.label === 'Crime 3' || item.label === 'Crime 4' ? 'bg-[#F59E0B]' : Number(item.crime_rate ?? item.percentage ?? 0) >= 70 ? 'bg-[#DC2626]' : 'bg-[#059669]'}`}
                            style={{ width: `${Number(item.crime_rate ?? item.percentage ?? 0)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[32px] border border-[#E5DCD5] bg-white p-8 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-[#8B0202]" />
                    <H3 className="text-[#1A2B3C]">Demographics</H3>
                  </div>
                  <Body className="text-[#4B5563] mb-6">Demographic data provides a general overview of the people living in the area based on publicly available statistics.</Body>
                  <div className="space-y-4">
                    {mockDemographics.slice(0, 7).map((item: any, index: number) => (
                      <div key={`${item.age_group ?? item.label ?? index}-${index}`}>
                        <div className="flex justify-between text-sm font-semibold text-[#1A2B3C]">
                          <span>{item.age_group ?? item.label ?? `Group ${index + 1}`}</span>
                          <span>{item.percentage ? `${item.percentage}%` : `${item.value ?? 0}%`}</span>
                        </div>
                        <div className="mt-2 h-4 rounded-full bg-[#E5E7EB]">
                          <div className="h-full rounded-full bg-[#8B0202]" style={{ width: `${Number(item.percentage ?? item.value ?? 0)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="space-y-6">
                <div className="rounded-[32px] border border-[#E5DCD5] bg-[#EFF6FF] p-8 shadow-sm">
                  <H3 className="text-[#1A2B3C] mb-4">Want the full area analysis?</H3>
                  <Body className="text-[#4B5563] mb-6">Unlock a structured Buyer or Investor Report with local data, RoomReview Score breakdown, nearby postcode comparison and source notes.</Body>
                  <Button className="w-full" variant="primary">Get full report</Button>
                </div>

                {districtData.length > 0 && (
                  <div className="rounded-[32px] border border-[#E5DCD5] bg-white p-8 shadow-sm">
                    <H3 className="text-[#1A2B3C] mb-4">District data</H3>
                    <Body className="text-[#4B5563] mb-4">The latest district reference linked to the borough dataset.</Body>
                    {districtData.map((item: any, index: number) => (
                      <div key={`${item.districtCode ?? item.boroughName ?? index}`} className="rounded-2xl bg-[#F9F7F5] p-4 text-sm text-[#1A2B3C]">
                        <p className="font-semibold">{item.districtCode || 'District code unavailable'}</p>
                        <p className="mt-1 text-[#6B7280]">{item.boroughName || 'Borough name unavailable'}</p>
                      </div>
                    ))}
                  </div>
                )}

                {educationData.length > 0 && (
                  <div className="rounded-[32px] border border-[#E5DCD5] bg-white p-8 shadow-sm">
                    <H3 className="text-[#1A2B3C] mb-4">Education indicators</H3>
                    <div className="space-y-3 text-sm text-[#4B5563]">
                      {educationData.slice(0, 4).map((item: any, index: number) => (
                        <div key={`${item.label ?? index}`} className="flex items-center justify-between gap-3 rounded-2xl bg-[#F9F7F5] p-3">
                          <span>{item.label}</span>
                          <span className="font-semibold text-[#1A2B3C]">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {housingStockData.length > 0 && (
                  <div className="rounded-[32px] border border-[#E5DCD5] bg-white p-8 shadow-sm">
                    <H3 className="text-[#1A2B3C] mb-4">Housing stock</H3>
                    <div className="space-y-3 text-sm text-[#4B5563]">
                      {housingStockData.slice(0, 4).map((item: any, index: number) => (
                        <div key={`${item.label ?? index}`} className="flex items-center justify-between gap-3 rounded-2xl bg-[#F9F7F5] p-3">
                          <span>{item.label}</span>
                          <span className="font-semibold text-[#1A2B3C]">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </div>

            <div className="mt-12">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <H2 className="text-[#1A2B3C]">Most recent reviews</H2>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-3">
                {reviewCards.map((review) => (
                  <div key={review.title} className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
                    <div className="mb-4">
                      <H3 className="text-[#1A2B3C] text-lg">{review.title}</H3>
                      <div className="mt-3 flex items-center gap-1 text-[#D97706]">
                        {Array.from({ length: review.stars }).map((_, starIndex) => (
                          <Star key={starIndex} className="w-4 h-4" />
                        ))}
                      </div>
                    </div>
                    <Body className="text-[#4B5563] mb-4">{review.summary}</Body>
                    <div className="space-y-4">
                      <div className="flex items-start gap-2 text-[#16A34A] text-sm">
                        <span className="text-xl">👍</span>
                        <div>
                          <p className="font-semibold">Pros</p>
                          <p>{review.pros}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-[#DC2626] text-sm">
                        <span className="text-xl">👎</span>
                        <div>
                          <p className="font-semibold">Cons</p>
                          <p>{review.cons}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 border-t border-[#E5E7EB] pt-4 text-sm text-[#6B7280]">
                      <p>{review.author}</p>
                      <p>{review.date}</p>
                    </div>
                  </div>
                ))}
              </div>
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
                      {fullPostcodeOptions.map((postcode) => (
                        <option key={postcode} value={postcode}>
                          {postcode}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <p className="text-sm uppercase tracking-[0.14em] text-[#8B0202] mb-2">Status</p>
                    <select className="w-full rounded-[18px] border border-[#D9D5D0] bg-white px-4 py-3 text-sm text-[#1A2B3C] focus:outline-none">
                      <option>Select your relation to the property/area</option>
                      <option>Local resident</option>
                      <option>Tenant</option>
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

              <Button className="w-full" variant="primary">Submit review</Button>
            </div>

            <div className="mt-12">
              <ScoreReportPanel
                boroughId={postcodeData?.boroughId ?? undefined}
                postcodeId={postcodeData?.postcode_id ?? undefined}
                boroughName={postcodeData?.boroughId ? undefined : undefined}
                postcodeCode={normalized || undefined}
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default PostcodePage;
