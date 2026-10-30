import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowDownUp, ChevronDown, ChevronLeft, ChevronRight, Home, Plus, Shield, Star, TrendingUp } from 'lucide-react';
import { H1, Body, Small } from '../components/common/Typography';
import Button from '../components/common/Button';
import heroImage from '@img/city.webp';
import { postcodeAreaReportPath, postcodePath, postcodeReviewPath, type PostcodeReviewAction } from '@/utils/helpers';
import { postcodeService, type PostcodeListItem, type PostcodeSort } from '@/services/postcode.service';
import { trackAnalyticsEvent } from '@/lib/cookieConsent';
import SeoMetadata from '@/components/common/SeoMetadata';

const formatCurrency = (value: number) => new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
}).format(value);

type CrimeFilter = 'all' | 'below-london' | 'above-london';
type PropertyValueFilter = 'all' | 'under-500k' | '500k-1m' | 'over-1m';
type RatingFilter = 'all' | '4-plus' | '3-plus' | 'unrated';

const PostcodeSearchPage = () => {
  const [postcode, setPostcode] = useState('');
  const [error, setError] = useState('');
  const [postcodes, setPostcodes] = useState<PostcodeListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalPostcodes, setTotalPostcodes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [crimeFilter, setCrimeFilter] = useState<CrimeFilter>('all');
  const [propertyValueFilter, setPropertyValueFilter] = useState<PropertyValueFilter>('all');
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [sortBy, setSortBy] = useState<PostcodeSort>('alphabetical-asc');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedAction = searchParams.get('reviewAction');
  const reviewAction: PostcodeReviewAction | null = requestedAction === 'read' || requestedAction === 'write'
    ? requestedAction
    : null;
  const isAreaReportJourney = searchParams.get('journey') === 'area-report';
  const pageSize = 100;

  const visiblePostcodes = postcodes.filter((item) => {
      if (crimeFilter === 'below-london' && (item.crimeRatePer1000 === null || item.londonAverageCrimeRatePer1000 === null || item.crimeRatePer1000 > item.londonAverageCrimeRatePer1000)) return false;
      if (crimeFilter === 'above-london' && (item.crimeRatePer1000 === null || item.londonAverageCrimeRatePer1000 === null || item.crimeRatePer1000 <= item.londonAverageCrimeRatePer1000)) return false;
      if (propertyValueFilter === 'under-500k' && (item.averagePrice === null || item.averagePrice >= 500_000)) return false;
      if (propertyValueFilter === '500k-1m' && (item.averagePrice === null || item.averagePrice < 500_000 || item.averagePrice >= 1_000_000)) return false;
      if (propertyValueFilter === 'over-1m' && (item.averagePrice === null || item.averagePrice < 1_000_000)) return false;
      if (ratingFilter === 'unrated' && item.averageRating !== null) return false;
      if (ratingFilter === '4-plus' && (item.averageRating === null || item.averageRating < 4)) return false;
      if (ratingFilter === '3-plus' && (item.averageRating === null || item.averageRating < 3)) return false;
      return true;
    });

  const dropdownClassName = 'w-full appearance-none bg-transparent py-3 pl-11 pr-8 text-base text-[#151515] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8B0202]';

  useEffect(() => {
    let isCurrent = true;
    setLoading(true);
    setLoadError(null);
    setPostcodes([]);

    void postcodeService.getAll(currentPage, pageSize, sortBy)
      .then((response) => {
        if (!isCurrent) return;
        setPostcodes(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalPostcodes(response.pagination.total);
      })
      .catch(() => {
        if (!isCurrent) return;
        setPostcodes([]);
        setLoadError('Postcodes could not be loaded. Please try again.');
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [currentPage, reloadKey, sortBy]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = postcode.trim();

    if (!trimmed) {
      setError('Enter a valid UK postcode');
      return;
    }

    setError('');
    trackAnalyticsEvent('postcode_search');
    navigate(isAreaReportJourney
      ? postcodeAreaReportPath(trimmed)
      : reviewAction ? postcodeReviewPath(trimmed, reviewAction) : postcodePath(trimmed));
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <SeoMetadata
        title="London Postcode Guide | RoomReview"
        description="Search London postcodes for local reviews, crime comparisons, property prices and area insights from RoomReview."
        path="/postcode-search"
      />
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] items-center">
          <div>
            <Small className="text-primary uppercase tracking-[0.22em] mb-3 block">
              Postcode search
            </Small>
            <H1 className="text-[#1A2B3C] leading-tight">
              Post Code Listing
            </H1>
            <Body className="mt-6 text-[#0B0B0B] leading-8 max-w-2xl">
              Welcome to the Postcode Listings page, your guide to exploring every London postcode with up-to-date data, local insights, and interactive tools to help you find great places to live, work, and visit.
            </Body>
            <Body className="mt-4 text-[#0B0B0B] leading-8 max-w-2xl">
              Please note that property details can vary within the same postcode, so <span className="font-semibold">always verify key information</span>—such as the exact address, condition, and legitimacy—directly with the landlord or letting agency before making any decisions.
            </Body>

            <form onSubmit={handleSearch} className="mt-10 grid gap-4 sm:grid-cols-[1fr_auto] items-center">
              <label className="sr-only" htmlFor="postcode-search">
                Postcode
              </label>
              <input
                id="postcode-search"
                type="text"
                value={postcode}
                onChange={(event) => setPostcode(event.target.value)}
                placeholder="Search for a postcode (AB1 C23)"
                className="w-full rounded-[18px] border border-[#D9D5D0] bg-white px-5 py-4 text-base text-[#1A2B3C] placeholder:text-gray-400 focus:outline-none shadow-sm"
              />
              <Button type="submit" className="w-full sm:w-auto" variant="primary">
                Search
              </Button>
            </form>

            {error && <p className="mt-4 text-sm text-primary">{error}</p>}
          </div>

          <div className="rounded-[36px] overflow-hidden shadow-[0_24px_60px_rgba(20,22,33,0.08)] border border-[#E5DCD5]">
            <img src={heroImage} alt="London street" className="w-full h-[420px] object-cover" fetchPriority="high" decoding="async" />
          </div>
        </div>

        <div className="mt-16">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <H1 className="text-xl font-semibold text-[#1A2B3C]">All postcodes</H1>
              <Body className="mt-2 text-[#4A4A4A]">
                {loading
                  ? 'Loading postcodes...'
                  : loadError
                    ? 'Postcode data is unavailable. Use “Try again” below.'
                  : totalPostcodes > 0
                    ? `Showing page ${currentPage} of ${totalPages}.`
                    : 'No postcodes are available yet.'}
              </Body>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#6B7280]" aria-live="polite">
              {loading ? 'Loading postcode listings' : `${visiblePostcodes.length} matches on this page`}
            </div>
          </div>

          <div className="mt-8 grid gap-4 rounded-2xl border border-[#E5E5E5] bg-white p-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="relative flex items-center rounded-lg border border-[#E5E5E5]">
              <Shield className="pointer-events-none absolute left-3 h-5 w-5 fill-[#111] text-[#111]" aria-hidden="true" />
              <span className="sr-only">Filter by crime rating</span>
              <select className={dropdownClassName} value={crimeFilter} onChange={(event) => {
                setCrimeFilter(event.target.value as CrimeFilter);
                setCurrentPage(1);
              }}>
                <option value="all">Crime Rating</option>
                <option value="below-london">Below London average</option>
                <option value="above-london">Above London average</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-[#111]" aria-hidden="true" />
            </label>

            <label className="relative flex items-center rounded-lg border border-[#E5E5E5]">
              <Home className="pointer-events-none absolute left-3 h-5 w-5 fill-[#111] text-[#111]" aria-hidden="true" />
              <span className="sr-only">Filter by property value</span>
              <select className={dropdownClassName} value={propertyValueFilter} onChange={(event) => {
                setPropertyValueFilter(event.target.value as PropertyValueFilter);
                setCurrentPage(1);
              }}>
                <option value="all">Property Value</option>
                <option value="under-500k">Under £500,000</option>
                <option value="500k-1m">£500,000–£999,999</option>
                <option value="over-1m">£1,000,000 and over</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-[#111]" aria-hidden="true" />
            </label>

            <label className="relative flex items-center rounded-lg border border-[#E5E5E5]">
              <Star className="pointer-events-none absolute left-3 h-5 w-5 fill-[#111] text-[#111]" aria-hidden="true" />
              <span className="sr-only">Filter by review rating</span>
              <select className={dropdownClassName} value={ratingFilter} onChange={(event) => {
                setRatingFilter(event.target.value as RatingFilter);
                setCurrentPage(1);
              }}>
                <option value="all">Rating</option>
                <option value="4-plus">4 stars and above</option>
                <option value="3-plus">3 stars and above</option>
                <option value="unrated">No reviews yet</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-[#111]" aria-hidden="true" />
            </label>

            <label className="relative flex items-center rounded-lg border border-[#E5E5E5]">
              <ArrowDownUp className="pointer-events-none absolute left-3 h-6 w-6 text-[#111]" aria-hidden="true" />
              <span className="sr-only">Sort postcode results</span>
              <select className={`${dropdownClassName} pl-12`} value={sortBy} onChange={(event) => {
                setSortBy(event.target.value as PostcodeSort);
                setCurrentPage(1);
              }}>
                <option value="alphabetical-asc">Sort by: Alphabetical (A → Z)</option>
                <option value="alphabetical-desc">Sort by: Alphabetical (Z → A)</option>
                <option value="crime-asc">Sort by: Crime rating (low to high)</option>
                <option value="crime-desc">Sort by: Crime rating (high to low)</option>
                <option value="price-asc">Sort by: Property value (low to high)</option>
                <option value="price-desc">Sort by: Property value (high to low)</option>
                <option value="rating-desc">Sort by: Rating (high to low)</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-[#111]" aria-hidden="true" />
            </label>
            <p className="text-xs text-[#6B7280] md:col-span-2 xl:col-span-4">Sorting applies across all postcodes before pagination. Filters apply to the current page.</p>
          </div>

          {loadError && (
            <div role="alert" className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <p>{loadError}</p>
              <button
                type="button"
                className="font-semibold underline"
                onClick={() => setReloadKey((key) => key + 1)}
              >
                Try again
              </button>
            </div>
          )}

          {!loadError && (
            <>
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {visiblePostcodes.map((result) => (
                  <article
                    key={result.postcodeId}
                    className="group relative flex min-h-[162px] flex-col rounded-xl border border-[#E5E5E5] bg-white p-3.5 shadow-[0_3px_12px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-md"
                  >
                    <Link
                      to={isAreaReportJourney
                        ? postcodeAreaReportPath(result.code)
                        : reviewAction ? postcodeReviewPath(result.code, reviewAction) : postcodePath(result.code)}
                      aria-label={isAreaReportJourney
                        ? `Download area report for ${result.code}`
                        : `View postcode details for ${result.code}`}
                      className="absolute inset-0 z-0 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0202]"
                    />
                    <div className="pointer-events-none relative z-10 flex min-h-[132px] flex-col">
                      <h2 className="text-sm font-bold text-[#8B0202] group-hover:text-[#700000]">
                        {result.code}
                      </h2>
                      <p className="mt-0.5 text-[10px] text-[#777]">{result.boroughName ?? 'Borough unavailable'}</p>

                    <div className="mt-4 flex flex-wrap items-center gap-1.5">
                      {result.crimeRatePer1000 !== null && result.londonAverageCrimeRatePer1000 !== null ? (
                        <span
                          title={`Recorded crime rate: ${result.crimeRatePer1000.toFixed(1)} per 1,000 residents; London average: ${result.londonAverageCrimeRatePer1000.toFixed(1)}.`}
                          className="inline-flex items-center gap-1 rounded-full border border-[#E5E5E5] px-1.5 py-0.5 text-[10px] leading-none text-[#222]"
                        >
                          <Shield
                            className={`h-3 w-3 ${result.crimeRatePer1000 <= result.londonAverageCrimeRatePer1000 ? 'fill-[#087A36] text-[#087A36]' : 'fill-[#B42318] text-[#B42318]'}`}
                            aria-hidden="true"
                          />
                          {result.crimeRatePer1000 <= result.londonAverageCrimeRatePer1000 ? 'Safe' : 'Higher crime'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#E5E5E5] px-1.5 py-0.5 text-[10px] leading-none text-[#555]">
                          <Shield className="h-3 w-3 text-[#777]" aria-hidden="true" />
                          Crime n/a
                        </span>
                      )}
                      <Link
                        to={isAreaReportJourney
                          ? postcodeAreaReportPath(result.code)
                          : reviewAction
                          ? postcodeReviewPath(result.code, reviewAction)
                          : `${postcodePath(result.code)}#reviews`}
                        className="pointer-events-auto relative z-20 inline-flex items-center gap-1 rounded-full border border-[#E5E5E5] px-1.5 py-0.5 text-[10px] leading-none text-[#555] hover:border-[#D97706]"
                      >
                        <Star className="h-3 w-3 fill-[#F4B400] text-[#F4B400]" aria-hidden="true" />
                        {result.averageRating !== null
                          ? (
                            <span className="text-[#222]">{result.averageRating.toFixed(1)}</span>
                          ) : <span className="text-[#777]">—</span>}
                        <span className="text-[#777]">· {result.reviewCount} reviews</span>
                      </Link>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span
                        title={result.priceSource === 'borough' ? 'Average sale price is the latest available borough-wide figure.' : 'Average sale price is calculated from available sales for this postcode.'}
                        className="inline-flex items-center gap-1 rounded-full border border-[#E5E5E5] px-1.5 py-0.5 text-[10px] leading-none text-[#555]"
                      >
                        <Home className="h-3 w-3 text-[#111]" aria-hidden="true" />
                        {result.averagePrice !== null
                          ? (
                            <>
                              Avg. Sale Price: <span className="font-semibold text-[#222]">{formatCurrency(result.averagePrice)}</span>
                            </>
                          )
                          : 'Avg. Sale Price: n/a'}
                      </span>
                      <span
                        title={`Year-over-year price trend${result.priceSource === 'borough' ? ' for this borough' : ' for this postcode'}.`}
                        className="inline-flex items-center gap-1 rounded-full border border-[#E5E5E5] px-1.5 py-0.5 text-[10px] leading-none text-[#8B0202]"
                      >
                        <TrendingUp className="h-3 w-3" aria-hidden="true" />
                        {result.priceGrowthPct !== null
                          ? `${result.priceGrowthPct > 0 ? '+' : ''}${result.priceGrowthPct.toFixed(1)}%`
                          : 'n/a'}
                      </span>
                    </div>

                    <Link
                      to={isAreaReportJourney
                        ? postcodeAreaReportPath(result.code)
                        : postcodeReviewPath(result.code, 'write')}
                      className="pointer-events-auto relative z-20 mt-auto inline-flex w-fit items-center gap-1 pt-4 text-[10px] text-[#334155] hover:text-[#8B0202]"
                    >
                      <Plus className="h-3 w-3" aria-hidden="true" />
                      {isAreaReportJourney ? 'Download area report' : 'Add review'}
                    </Link>
                    </div>
                  </article>
                ))}
              </div>

              {!loading && visiblePostcodes.length === 0 && (
                <div className="mt-8 rounded-xl border border-[#E5DCD5] bg-white p-6 text-center">
                  <p className="text-sm font-semibold text-[#1A2B3C]">
                    No postcodes on this page match these filters.
                  </p>
                  <p className="mt-2 text-sm text-[#6B7280]">
                    Filters apply to the current page only. Try another page or clear the filters.
                  </p>
                  <button
                    type="button"
                    className="mt-4 rounded-lg bg-[#8B0202] px-4 py-2 text-sm font-semibold text-white hover:bg-[#700000]"
                    onClick={() => {
                      setCrimeFilter('all');
                      setPropertyValueFilter('all');
                      setRatingFilter('all');
                      setCurrentPage(1);
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}

              {totalPages > 1 && (
                <nav className="mt-8 flex items-center justify-center gap-6" aria-label="Postcode pages">
                  <button
                    type="button"
                    className="rounded-full p-2 text-[#8B0202] transition-opacity disabled:opacity-30"
                    disabled={currentPage === 1 || loading}
                    onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                    aria-label="Previous postcode page"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <span className="text-sm font-semibold text-[#1A2B3C]" aria-live="polite">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    className="rounded-full p-2 text-[#8B0202] transition-opacity disabled:opacity-30"
                    disabled={currentPage === totalPages || loading}
                    onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                    aria-label="Next postcode page"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default PostcodeSearchPage;
